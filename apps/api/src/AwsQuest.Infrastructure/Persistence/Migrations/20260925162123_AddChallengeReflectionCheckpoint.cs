using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AwsQuest.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChallengeReflectionCheckpoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'challenges' AND column_name = 'BriefingJson'
    ) THEN
        ALTER TABLE challenges RENAME COLUMN ""BriefingJson"" TO briefing_json;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'challenges' AND column_name = 'briefing_json' AND data_type = 'text'
    ) THEN
        ALTER TABLE challenges ALTER COLUMN briefing_json TYPE jsonb USING briefing_json::jsonb;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'challenges' AND column_name = 'briefing_json'
    ) THEN
        ALTER TABLE challenges ADD COLUMN briefing_json jsonb;
    END IF;
END $$;
");

            migrationBuilder.AddColumn<DateTime>(
                name: "reflection_answered_at",
                table: "user_progress",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "reflection_completed",
                table: "user_progress",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "reflection_selected_option_id",
                table: "user_progress",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "reflection_prompt_json",
                table: "challenges",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "reflection_answered_at",
                table: "user_progress");

            migrationBuilder.DropColumn(
                name: "reflection_completed",
                table: "user_progress");

            migrationBuilder.DropColumn(
                name: "reflection_selected_option_id",
                table: "user_progress");

            migrationBuilder.DropColumn(
                name: "reflection_prompt_json",
                table: "challenges");
        }
    }
}
