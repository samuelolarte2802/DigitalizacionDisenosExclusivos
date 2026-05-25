using DigitalizacionAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DigitalizacionAPI.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<DetallePedido>()
                    .Property(d => d.IdDetalle)
                    .ValueGeneratedOnAdd();

            modelBuilder.Entity<Rol>()
                    .Property(r => r.IdRol)
                    .ValueGeneratedOnAdd();

            modelBuilder.Entity<Usuario>()
                    .Property(u => u.IdUsuario)
                    .ValueGeneratedOnAdd();

            modelBuilder.Entity<ListaPrecio>()
                    .Property(l => l.IdPrecio)
                    .ValueGeneratedOnAdd();

            modelBuilder.Entity<Proveedor>()
                .Property(p => p.IdProveedor)
                .ValueGeneratedOnAdd();

        }
        public DbSet<Institucion> Instituciones { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<ListaPrecio> ListasPrecios { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallesPedidos { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Rol> Roles { get; set; }

    }
}
