using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AwsQuest.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "aws_services",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ShortDescription = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    IconUrl = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aws_services", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "system_configs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AccessMode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_configs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsGuest = table.Column<bool>(type: "boolean", nullable: false),
                    TotalXP = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Level = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "challenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrerequisiteChallengeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Difficulty = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Mode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "BUILDER"),
                    RequiredXP = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    evaluation_rules_json = table.Column<string>(type: "jsonb", nullable: false),
                    hints_json = table.Column<string>(type: "jsonb", nullable: false),
                    BaseXP = table.Column<int>(type: "integer", nullable: false, defaultValue: 100),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_challenges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_challenges_challenges_PrerequisiteChallengeId",
                        column: x => x.PrerequisiteChallengeId,
                        principalTable: "challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_challenges_units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "challenge_services",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChallengeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    MaxInstances = table.Column<int>(type: "integer", nullable: true),
                    IsDistractor = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_challenge_services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_challenge_services_aws_services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "aws_services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_challenge_services_challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_progress",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChallengeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    HighScore = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    HintsUsed = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    last_attempt_graph_json = table.Column<string>(type: "jsonb", nullable: true),
                    FirstCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_progress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_progress_challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_progress_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "challenge_attempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProgressId = table.Column<Guid>(type: "uuid", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    Passed = table.Column<bool>(type: "boolean", nullable: false),
                    HintsUsed = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    graph_submitted_json = table.Column<string>(type: "jsonb", nullable: false),
                    evaluation_result_json = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_challenge_attempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_challenge_attempts_user_progress_ProgressId",
                        column: x => x.ProgressId,
                        principalTable: "user_progress",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_aws_services_Code",
                table: "aws_services",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_challenge_attempts_ProgressId",
                table: "challenge_attempts",
                column: "ProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_challenge_attempts_ProgressId_CreatedAt",
                table: "challenge_attempts",
                columns: new[] { "ProgressId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_challenge_services_ChallengeId",
                table: "challenge_services",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_challenge_services_ChallengeId_ServiceId",
                table: "challenge_services",
                columns: new[] { "ChallengeId", "ServiceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_challenge_services_ServiceId",
                table: "challenge_services",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_challenges_PrerequisiteChallengeId",
                table: "challenges",
                column: "PrerequisiteChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_challenges_UnitId",
                table: "challenges",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_challenges_UnitId_OrderIndex",
                table: "challenges",
                columns: new[] { "UnitId", "OrderIndex" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_units_OrderIndex",
                table: "units",
                column: "OrderIndex",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_progress_ChallengeId",
                table: "user_progress",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_user_progress_UserId_ChallengeId",
                table: "user_progress",
                columns: new[] { "UserId", "ChallengeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_progress_UserId_Status",
                table: "user_progress",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true,
                filter: "\"Email\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "challenge_attempts");

            migrationBuilder.DropTable(
                name: "challenge_services");

            migrationBuilder.DropTable(
                name: "system_configs");

            migrationBuilder.DropTable(
                name: "user_progress");

            migrationBuilder.DropTable(
                name: "aws_services");

            migrationBuilder.DropTable(
                name: "challenges");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "units");
        }
    }
}
