using Microsoft.EntityFrameworkCore;
using Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Material> Materials { get; set; }
    public DbSet<ClothingType> ClothingTypes { get; set; }
    public DbSet<ProductMaterial> ProductMaterials { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderDetail> OrderDetails { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<Color> Colors { get; set; }
    public DbSet<Size> Sizes { get; set; }
    public DbSet<ProductVariant> ProductVariants { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Chat relationships
        modelBuilder.Entity<Chat>()
            .HasOne(c => c.Sender)
            .WithMany()
            .HasForeignKey(c => c.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
            
        modelBuilder.Entity<Chat>()
            .HasOne(c => c.Receiver)
            .WithMany()
            .HasForeignKey(c => c.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Address relationships
        modelBuilder.Entity<Address>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // ProductMaterial relationships
        modelBuilder.Entity<ProductMaterial>()
            .HasOne(pm => pm.Product)
            .WithMany(p => p.ProductMaterials)
            .HasForeignKey(pm => pm.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductMaterial>()
            .HasOne(pm => pm.Material)
            .WithMany(m => m.ProductMaterials)
            .HasForeignKey(pm => pm.MaterialId)
            .OnDelete(DeleteBehavior.Cascade);

        // Product-ClothingType relationship
        modelBuilder.Entity<Product>()
            .HasOne(p => p.ClothingType)
            .WithMany(ct => ct.Products)
            .HasForeignKey(p => p.ClothingTypeId)
            .OnDelete(DeleteBehavior.SetNull);

        // ProductVariant relationships
        modelBuilder.Entity<ProductVariant>()
            .HasOne(pv => pv.Product)
            .WithMany(p => p.ProductVariants)
            .HasForeignKey(pv => pv.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductVariant>()
            .HasOne(pv => pv.Color)
            .WithMany(c => c.ProductVariants)
            .HasForeignKey(pv => pv.ColorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProductVariant>()
            .HasOne(pv => pv.Size)
            .WithMany(s => s.ProductVariants)
            .HasForeignKey(pv => pv.SizeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Note: Removed unique constraint to allow multiple variants with same Product+Color+Size
        // This allows for scenarios like: Product1-Red-SizeM can have multiple entries
        // modelBuilder.Entity<ProductVariant>()
        //     .HasIndex(pv => new { pv.ProductId, pv.ColorId, pv.SizeId })
        //     .IsUnique();

        // Note: ProductVariantId in Cart, OrderDetails, Wishlist are just foreign key columns
        // without explicit foreign key constraints to avoid cascade path issues
            
        base.OnModelCreating(modelBuilder);
    }
}