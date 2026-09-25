using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AwsQuest.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChallengeBriefing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'challenges' AND column_name = 'briefing_json'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'challenges' AND column_name = 'BriefingJson'
        ) THEN
            ALTER TABLE challenges RENAME COLUMN ""BriefingJson"" TO briefing_json;
            ALTER TABLE challenges ALTER COLUMN briefing_json TYPE jsonb USING briefing_json::jsonb;
        ELSE
            ALTER TABLE challenges ADD COLUMN briefing_json jsonb;
        END IF;
    END IF;
END $$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE challenges DROP COLUMN IF EXISTS ""BriefingJson""; ALTER TABLE challenges DROP COLUMN IF EXISTS briefing_json;");
        }
    }
}
