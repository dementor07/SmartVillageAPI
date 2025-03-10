using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartVillageAPI.Data;
using SmartVillageAPI.Models.Auth;
using SmartVillageAPI.Services;
using SmartVillageAPI.Utilities;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? new JwtSettings();
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

// Add JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        ClockSkew = TimeSpan.FromMinutes(5) // Added 5-minute clock skew to prevent timing issues
    };
});

// Add services
builder.Services.AddScoped<JwtService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT auth
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Smart Village API", Version = "v1" });

    // Configure Swagger to use JWT Authentication
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure CORS - properly configured for both development and production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

    options.AddPolicy("Production",
        builder => builder
            .WithOrigins("https://yourproductionurl.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowAll"); // Use permissive CORS in development
}
else
{
    app.UseHsts();
    app.UseCors("Production"); // Use restricted CORS in production
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialize database with seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Ensuring database is created...");

        // Ensure database exists
        context.Database.EnsureCreated();

        // NEW: Fix migrations using our utility with fresh context to avoid connection issues
        logger.LogInformation("Applying database migrations and fixes...");

        // Create a new context for migrations to avoid connection state issues
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(context.Database.GetConnectionString())
            .Options;

        using (var newContext = new ApplicationDbContext(options))
        {
            await MigrationFixUtility.FixMigrations(newContext, logger);
        }

        // Also run the original table check logic for backward compatibility
        using (var newContext = new ApplicationDbContext(options))
        {
            await DatabaseInitializer.EnsureTablesExist(newContext, logger);
        }

        logger.LogInformation("Seeding database...");
        using (var newContext = new ApplicationDbContext(options))
        {
            DbInitializer.SeedData(newContext);
        }

        logger.LogInformation("Database initialization complete");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during database initialization.");
    }
}

app.Run();