<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_login(): void
    {
        $register = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $register->assertCreated()->assertJsonPath('success', true);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'password',
        ]);

        $login->assertOk()->assertJsonPath('success', true)->assertJsonStructure([
            'data' => ['token'],
        ]);
    }

    public function test_user_can_request_password_reset_link(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'someone@example.com',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'If the email exists, a password reset link has been sent.');
    }
}
