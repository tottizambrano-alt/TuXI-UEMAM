using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// CONFIGURAR SERVICIOS
// ========================================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

// ========================================
// BASE DE DATOS EN MEMORIA
// ========================================

builder.Services.AddDbContext<AppDbContext>(options =>
options.UseInMemoryDatabase("MercadoLibreDb"));

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
// SWAGGER
// ========================================

app.UseSwagger();

app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint(
    "/swagger/v1/swagger.json",
    "MercadoLibre API v1"
    );


c.RoutePrefix = string.Empty;

});

// ========================================
// CORS
// ========================================

app.UseCors("AllowAll");

// ========================================
// AUTORIZACIÓN
// ========================================

app.UseAuthorization();

// ========================================
// CONTROLADORES
// ========================================

app.MapControllers();

// ========================================
// PUERTO LOCAL
// ========================================

app.Run("http://localhost:5000");
