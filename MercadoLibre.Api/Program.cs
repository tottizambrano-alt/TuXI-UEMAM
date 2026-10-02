using Microsoft.EntityFrameworkCore;
using MercadoLibre.Api.Data;

var builder = WebApplication.CreateBuilder(args);

<<<<<<< HEAD
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

=======
// Configurar servicios
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Base de datos en memoria
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("MercadoLibreDb"));

// Configurar CORS para permitir peticiones desde el frontend
>>>>>>> 8272aec45483f17f108c1363394b294c9f0410ad
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
<<<<<<< HEAD
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
=======
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Habilitar Swagger siempre (incluso en producción en Render)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MercadoLibre API v1");
    c.RoutePrefix = string.Empty; // <-- Esto hace que Swagger abra directamente en la raíz "/"
});

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
>>>>>>> 8272aec45483f17f108c1363394b294c9f0410ad
