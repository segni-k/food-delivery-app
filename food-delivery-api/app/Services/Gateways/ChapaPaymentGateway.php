<?php

namespace App\Services\Gateways;

use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ChapaPaymentGateway implements PaymentGatewayInterface
{
    public function createIntent(array $payload): array
    {
        $secretKey = (string) config('services.chapa.secret_key');
        if ($secretKey === '') {
            throw new RuntimeException('CHAPA_SECRET_KEY is not configured.');
        }

        try {
            $response = Http::withToken($secretKey)
                ->post(config('services.chapa.base_url') . '/transaction/initialize', $payload)
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            $responseBody = $exception->response?->json();
            $gatewayMessage = $this->extractGatewayMessage($responseBody);

            throw new RuntimeException(
                $gatewayMessage !== '' ? $gatewayMessage : 'Payment gateway rejected initialization request.'
            );
        }

        return [
            'checkout_url' => $response['data']['checkout_url'] ?? null,
            'tx_ref' => $payload['tx_ref'] ?? null,
            'raw' => $response,
        ];
    }

    public function verify(string $transactionRef): array
    {
        $secretKey = (string) config('services.chapa.secret_key');
        if ($secretKey === '') {
            throw new RuntimeException('CHAPA_SECRET_KEY is not configured.');
        }

        try {
            $response = Http::withToken($secretKey)
                ->get(config('services.chapa.base_url') . '/transaction/verify/' . $transactionRef)
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            $responseBody = $exception->response?->json();
            $gatewayMessage = $this->extractGatewayMessage($responseBody);

            throw new RuntimeException(
                $gatewayMessage !== '' ? $gatewayMessage : 'Payment gateway rejected verification request.'
            );
        }

        return [
            'status' => $response['data']['status'] ?? null,
            'raw' => $response,
        ];
    }

    private function extractGatewayMessage(mixed $responseBody): string
    {
        if (! is_array($responseBody)) {
            return '';
        }

        $message = $responseBody['message'] ?? '';
        if (is_string($message)) {
            return trim($message);
        }
        if (is_array($message)) {
            $flattened = collect($message)->flatten()->filter(fn ($entry) => is_scalar($entry))->all();
            return trim(implode(' ', array_map(fn ($entry) => (string) $entry, $flattened)));
        }

        return '';
    }
}
