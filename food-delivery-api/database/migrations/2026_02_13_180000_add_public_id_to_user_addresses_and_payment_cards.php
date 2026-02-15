<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_addresses') && ! Schema::hasColumn('user_addresses', 'public_id')) {
            Schema::table('user_addresses', function (Blueprint $table): void {
                $table->uuid('public_id')->nullable()->after('id');
            });
        }

        if (Schema::hasTable('payment_cards') && ! Schema::hasColumn('payment_cards', 'public_id')) {
            Schema::table('payment_cards', function (Blueprint $table): void {
                $table->uuid('public_id')->nullable()->after('id');
            });
        }

        if (Schema::hasTable('user_addresses') && Schema::hasColumn('user_addresses', 'public_id')) {
            DB::table('user_addresses')
                ->whereNull('public_id')
                ->orderBy('id')
                ->get(['id'])
                ->each(function (object $row): void {
                    DB::table('user_addresses')
                        ->where('id', $row->id)
                        ->update(['public_id' => (string) Str::uuid()]);
                });

            Schema::table('user_addresses', function (Blueprint $table): void {
                $table->unique('public_id', 'user_addresses_public_id_unique');
            });
        }

        if (Schema::hasTable('payment_cards') && Schema::hasColumn('payment_cards', 'public_id')) {
            DB::table('payment_cards')
                ->whereNull('public_id')
                ->orderBy('id')
                ->get(['id'])
                ->each(function (object $row): void {
                    DB::table('payment_cards')
                        ->where('id', $row->id)
                        ->update(['public_id' => (string) Str::uuid()]);
                });

            Schema::table('payment_cards', function (Blueprint $table): void {
                $table->unique('public_id', 'payment_cards_public_id_unique');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('user_addresses') && Schema::hasColumn('user_addresses', 'public_id')) {
            Schema::table('user_addresses', function (Blueprint $table): void {
                $table->dropUnique('user_addresses_public_id_unique');
                $table->dropColumn('public_id');
            });
        }

        if (Schema::hasTable('payment_cards') && Schema::hasColumn('payment_cards', 'public_id')) {
            Schema::table('payment_cards', function (Blueprint $table): void {
                $table->dropUnique('payment_cards_public_id_unique');
                $table->dropColumn('public_id');
            });
        }
    }
};
