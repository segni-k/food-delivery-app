<?php

namespace App\Services\Contracts;

interface PaymentGatewayInterface
{
    public function createIntent(array $payload): array;

    public function verify(string $transactionRef): array;
}
