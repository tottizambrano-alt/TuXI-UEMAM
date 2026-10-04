using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// CONFIGURACIÓN DE SERVICIOS
// ========================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// ========================================
// BASE DE DATOS SQLITE
// ========================================

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=tuxi.db";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(connectionString);
});

// ========================================
// CORS
// ========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// ========================================
// CREAR APLICACIÓN
// ========================================

var app = builder.Build();

// ========================================
// CREAR BASE DE DATOS
// ========================================

using (var scope = app.Services.CreateScope())
{
    var db =
        scope.ServiceProvider
            .GetRequiredService<AppDbContext>();

    db.Database.EnsureCreated();
}

// ========================================
// SWAGGER
// ========================================

app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint(
        "/swagger/v1/swagger.json",
        "MercadoLibre API v1"
    );

    c.RoutePrefix = "swagger";
});

// ========================================
// ARCHIVOS ESTÁTICOS DEL FRONTEND
// ========================================

app.UseDefaultFiles(
    new DefaultFilesOptions
    {
        FileProvider =
            new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
                Path.Combine(
                    builder.Environment.ContentRootPath,
                    "..",
                    "MercadoLibre.Web"
                )
            )
    }
);

app.UseStaticFiles(
    new StaticFileOptions
    {
        FileProvider =
            new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
                Path.Combine(
                    builder.Environment.ContentRootPath,
                    "..",
                    "MercadoLibre.Web"
                )
            )
    }
);

// ========================================
// MIDDLEWARE
// ========================================

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

// ========================================
// CONTROLADORES
// ========================================

app.MapControllers();

// ========================================
// EJECUTAR
// ========================================

app.Run();