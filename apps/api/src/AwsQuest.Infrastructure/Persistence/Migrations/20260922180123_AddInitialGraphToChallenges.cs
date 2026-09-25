using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AwsQuest.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInitialGraphToChallenges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "initial_graph_json",
                table: "challenges",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "initial_graph_json",
                table: "challenges");
        }
    }
}
