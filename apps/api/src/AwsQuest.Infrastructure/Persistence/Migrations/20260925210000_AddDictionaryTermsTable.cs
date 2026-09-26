using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AwsQuest.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDictionaryTermsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dictionary_terms",
                columns: table => new
                {
                    slug = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    category = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    service_code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    pillar = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    short_definition = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    what_is = table.Column<string>(type: "text", nullable: false),
                    when_to_use = table.Column<string>(type: "jsonb", nullable: true),
                    trade_offs = table.Column<string>(type: "jsonb", nullable: true),
                    related_term_slugs = table.Column<string>(type: "jsonb", nullable: true),
                    associated_challenge_ids = table.Column<string>(type: "jsonb", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dictionary_terms", x => x.slug);
                });

            migrationBuilder.CreateIndex(
                name: "IX_dictionary_terms_category",
                table: "dictionary_terms",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "IX_dictionary_terms_service_code",
                table: "dictionary_terms",
                column: "service_code");

            migrationBuilder.CreateIndex(
                name: "IX_dictionary_terms_pillar",
                table: "dictionary_terms",
                column: "pillar");

            migrationBuilder.CreateIndex(
                name: "IX_dictionary_terms_title",
                table: "dictionary_terms",
                column: "title");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dictionary_terms");
        }
    }
}
