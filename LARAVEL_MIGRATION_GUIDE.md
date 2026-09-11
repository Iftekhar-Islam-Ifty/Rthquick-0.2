# Earthquick (Nous Telos) — Master Laravel Integration & Migration Guide
> **Phase 15: Frontend Prototype → Laravel Blade & MySQL Architecture**  
> *Prepared specifically for Junior CSE Students & Laravel Beginners.*

---

## ১. ভূমিকা ও লক্ষ্য (Introduction & Objectives)

আমাদের বর্তমান প্রজেক্টটি একটি **HTML5 + CSS3 + Bootstrap 5 + Vanilla JavaScript** ভিত্তিক স্ট্যাটিক ফ্রন্টএন্ড প্রোটোটাইপ।

এই গাইডটির মূল উদ্দেশ্য হলো:
1. স্ট্যাটিক ফাইলগুলোকে স্ট্যান্ডার্ড **Laravel 10/11/12** ডিরেক্টরি কাঠামোতে স্থানান্তর করা।
2. বারবার ব্যবহৃত HTML অংশগুলোকে **Blade Components & Partials**-এ রূপান্তর করা।
3. ক্যাটাগরি, সাবক্যাটাগরি ও প্রোডাক্টগুলোকে **MySQL Database ও Eloquent ORM**-এর আওতায় আনা।
4. সেশন বা ডাটাবেজ নির্ভর **কার্ট ও অর্ডার প্রসেসিং (Checkout)** সিস্টেম চালু করা।
5. ভবিষ্যতে খুব সহজে **cPanel / Shared Hosting**-এ ওয়েবসাইটটি লাইভ ডিপ্লয় করার উপযোগী করে প্রস্তুত রাখা।

---

## ২. ডিরেক্টরি ম্যাপিং (Static → Laravel Directory Mapping)

| বর্তমান স্ট্যাটিক ফাইল/ফোল্ডার | লারাভেল ডিরেক্টরি লোকেশন | বিবরণ |
| :--- | :--- | :--- |
| `/css/style.css` | `public/css/style.css` | মূল সিএসএস ফাইল |
| `/js/script.js` | `public/js/script.js` | গ্লোবাল স্ক্রিপ্ট, কার্ট ড্রয়ার ও কুইকভিউ |
| `/js/category.js` | `public/js/category.js` | ক্যাটালগ ফিল্টারিং ও ডায়নামিক গ্রিড |
| `/images/*` | `public/images/*` | লোগো, ব্যানার ও প্রোডাক্ট ছবি (পরে `storage/app/public` এ যাবে) |
| `/components/navbar.html` | `resources/views/partials/navbar.blade.php` | হেডার ও ন্যাভিগেশন মেন্যু |
| `/components/footer.html` | `resources/views/partials/footer.blade.php` | ফুটার, সার্চ মডাল ও টোস্ট কন্টেইনার |
| `/index.html` | `resources/views/home.blade.php` | হোমপেজ ভিউ |
| `/pages/category.html` | `resources/views/category/show.blade.php` | যেকোনো ক্যাটাগরি/সাবক্যাটাগরির রিউজেবল ক্যাটালগ |
| `/pages/product.html` | `resources/views/product/show.blade.php` | প্রোডাক্ট সিঙ্গেল ডিটেইল ভিউ |
| `/pages/checkout.html` | `resources/views/checkout/index.blade.php` | বিলিং ও অর্ডার প্লেসমেন্ট ভিউ |
| `/pages/about.html` | `resources/views/pages/about.blade.php` | এবাউট ও ব্র্যান্ড স্টোরি |
| `/pages/account.html` | `resources/views/account/dashboard.blade.php` | কাস্টমার ড্যাশবোর্ড ও অর্ডার হিস্ট্রি |

---

## ৩. মাস্টার লেআউট আর্কিটেকচার (`resources/views/layouts/app.blade.php`)

লারাভেলে প্রতি পেজে সম্পূর্ণ HTML হেড ও বডি বারবার না লিখে একটি কমন মাস্টার লেআউট তৈরি করতে হয়:

```html
<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <title>@yield('title', 'Earthquick — Crafted for the Modern You')</title>
  <meta name="description" content="@yield('meta_description', 'Earthquick is a premium fashion and lifestyle brand featuring Saree, Three Piece, Two Piece and Bags from Nous Telos.')" />

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />

  <!-- Earthquick Custom Stylesheet -->
  <link rel="stylesheet" href="{{ asset('css/style.css') }}" />

  @stack('styles')
</head>
<body>

  <!-- Skip Navigation -->
  <a href="#main-content" class="eq-skip-link">Skip to main content</a>

  <!-- Header Navigation Partial -->
  @include('partials.navbar')

  <!-- Main Content Body -->
  <main id="main-content">
    @yield('content')
  </main>

  <!-- Footer Partial -->
  @include('partials.footer')

  <!-- Cart Drawer & Quickview Modals -->
  @include('partials.cart-drawer')
  @include('partials.quickview-modal')

  <!-- Core Scripts -->
  <script src="{{ asset('js/script.js') }}"></script>
  @stack('scripts')
</body>
</html>
```

---

## ৪. রিউজেবল ব্লেড কম্পোনেন্ট (Reusable Blade Components)

### ক. প্রোডাক্ট কার্ড কম্পোনেন্ট (`resources/views/components/product-card.blade.php`)

```html
@props(['product'])

<article class="eq-product-card" id="product-card-{{ $product->id }}">
  <a href="{{ route('product.show', $product->slug) }}" class="eq-product-card__link">
    <div class="eq-product-card__frame">
      @if($product->badge)
        <span class="eq-badge {{ $product->badge_type ? 'eq-badge--' . $product->badge_type : '' }}">
          {{ $product->badge }}
        </span>
      @endif

      <!-- Primary Image -->
      <img src="{{ asset($product->image) }}" alt="{{ $product->name }}" loading="lazy" decoding="async" />

      <!-- Hover Alt Image (if available) -->
      @if($product->alt_image)
        <img class="eq-product-card__img--alt" src="{{ asset($product->alt_image) }}" alt="{{ $product->name }} alternate view" loading="lazy" decoding="async" />
      @endif

      <span class="eq-product-card__quick-add">View product</span>
    </div>

    <div class="eq-product-card__body">
      <span class="eq-product-card__category">{{ $product->subcategory->name ?? $product->category->name }}</span>
      <h3 class="eq-product-card__name">{{ $product->name }}</h3>
      <p class="eq-product-card__price">
        ৳{{ number_format($product->price) }}
        @if($product->old_price && $product->old_price > $product->price)
          <span class="eq-price--old">৳{{ number_format($product->old_price) }}</span>
        @endif
      </p>
    </div>
  </a>
</article>
```

**হোমপেজ বা ক্যাটালগ পেজে ব্যবহারের নিয়ম:**
```html
@foreach($products as $product)
  <x-product-card :product="$product" />
@endforeach
```

---

## ৫. ডাটাবেজ স্কিমা ও মাইগ্রেশন (MySQL Database Migrations)

আমাদের বর্তমান জাভাস্ক্রিপ্ট ডেটাসেট অনুযায়ী নিম্নলিখিত টেবিলগুলো তৈরি করতে হবে:

### ১. `categories` টেবিল
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');             // e.g. Women, Men, Kids, Ornaments, Bags, Home Decor
    $table->string('slug')->unique();   // e.g. women, men, bags
    $table->string('image')->nullable();
    $table->text('description')->nullable();
    $table->boolean('is_active')->default(true);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### ২. `subcategories` টেবিল
```php
Schema::create('subcategories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->string('name');             // e.g. Saree, Three Piece, Two Piece, Kantha, Bedsheet
    $table->string('slug')->unique();   // e.g. saree, three-piece, kantha
    $table->string('image')->nullable();
    $table->boolean('is_active')->default(true);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### ৩. `products` টেবিল
```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->foreignId('subcategory_id')->nullable()->constrained()->nullOnDelete();
    $table->string('sku')->unique()->nullable();
    $table->string('name');             // e.g. Crimson Red Muslin Jamdani Saree
    $table->string('slug')->unique();   // e.g. crimson-red-muslin-jamdani-saree
    $table->decimal('price', 10, 2);    // e.g. 8500.00
    $table->decimal('old_price', 10, 2)->nullable();
    $table->string('fabric')->nullable(); // e.g. Muslin, Silk, Cotton, Linen, Leather
    $table->text('short_desc')->nullable();
    $table->longText('description')->nullable();
    $table->string('image');            // Main thumbnail
    $table->string('alt_image')->nullable(); // Hover image
    $table->string('badge')->nullable(); // e.g. "New", "Signature", "Heritage"
    $table->string('badge_type')->nullable(); // e.g. "new", "gold", "signature"
    $table->decimal('rating', 2, 1)->default(4.9);
    $table->unsignedInteger('reviews_count')->default(0);
    $table->boolean('in_stock')->default(true);
    $table->unsignedInteger('stock_quantity')->default(10);
    $table->boolean('is_featured')->default(false);
    $table->boolean('is_new_arrival')->default(false);
    $table->timestamps();
});
```

### ৪. `product_images` টেবিল (গ্যালারির একাধিক ছবির জন্য)
```php
Schema::create('product_images', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->cascadeOnDelete();
    $table->string('image_path');
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### ৫. `orders` টেবিল (বাংলাদেশ ও চট্টগ্রাম ভিত্তিক চেকআউট)
```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('order_number')->unique(); // e.g. EQ-2026-7892
    $table->string('customer_name');
    $table->string('customer_phone');
    $table->string('customer_email')->nullable();
    $table->string('delivery_zone'); // 'inside_ctg' (৳80) or 'outside_ctg' (৳150)
    $table->string('district');      // e.g. Chattogram, Dhaka
    $table->string('area');          // e.g. GEC Circle, Nasirabad, Dhanmondi
    $table->text('address');         // Detailed holding/street
    $table->text('order_notes')->nullable();
    $table->string('payment_method')->default('cod'); // 'cod' or 'bkash'
    $table->decimal('subtotal', 10, 2);
    $table->decimal('delivery_fee', 10, 2);
    $table->decimal('total', 10, 2);
    $table->string('status')->default('pending'); // pending, confirmed, processing, shipped, delivered, cancelled
    $table->timestamps();
});
```

### ৬. `order_items` টেবিল
```php
Schema::create('order_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->cascadeOnDelete();
    $table->foreignId('product_id')->constrained();
    $table->string('product_name');
    $table->string('product_image')->nullable();
    $table->decimal('unit_price', 10, 2);
    $table->unsignedInteger('quantity');
    $table->decimal('total_price', 10, 2);
    $table->timestamps();
});
```

---

## ৬. রাউটিং ও কন্ট্রোলার (`routes/web.php`)

```php
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\PageController;

// 1. Homepage
Route::get('/', [HomeController::class, 'index'])->name('home');

// 2. Category & Subcategory Catalog
Route::get('/shop/{category:slug}', [CategoryController::class, 'showCategory'])->name('category.show');
Route::get('/shop/{category:slug}/{subcategory:slug}', [CategoryController::class, 'showSubcategory'])->name('subcategory.show');

// 3. Product Details
Route::get('/product/{product:slug}', [ProductController::class, 'show'])->name('product.show');

// 4. Cart APIs / Actions
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');

// 5. Checkout
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/order', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/success/{order:order_number}', [CheckoutController::class, 'success'])->name('checkout.success');

// 6. Static Pages
Route::get('/about', [PageController::class, 'about'])->name('about');
```

---

## ৭. ক্যাটালগ পেজকে একটিমাত্র ডায়নামিক ব্লেড ফাইলে কনভার্ট করা

বর্তমান প্রজেক্টে `saree.html`, `two-piece.html`, `bags.html`, `men.html` ইত্যাদি আলাদা পেজ তৈরি করা আছে স্ট্যাটিক প্রিভিউ দেখার সুবিধার্থে।

**লারাভেলে এগুলোকে একটিমাত্র ফাইলে রূপান্তর করবেন:**
`resources/views/category/show.blade.php`

**কন্ট্রোলারের কোড উদাহরণ (`CategoryController.php`):**
```php
public function showCategory(Request $request, Category $category)
{
    $query = Product::where('category_id', $category->id)->where('in_stock', true);

    // Filter by Fabric
    if ($request->filled('fabric')) {
        $fabrics = explode(',', $request->query('fabric'));
        $query->whereIn('fabric', $fabrics);
    }

    // Filter by Price
    if ($request->filled('min_price')) {
        $query->where('price', '>=', $request->query('min_price'));
    }
    if ($request->filled('max_price')) {
        $query->where('price', '<=', $request->query('max_price'));
    }

    // Sort order
    match ($request->query('sort')) {
        'price-asc'  => $query->orderBy('price', 'asc'),
        'price-desc' => $query->orderBy('price', 'desc'),
        'rating'     => $query->orderBy('rating', 'desc'),
        default      => $query->latest()
    };

    $products = $query->paginate(12)->withQueryString();

    return view('category.show', compact('category', 'products'));
}
```

---

## ৮. cPanel ডিপ্লয়মেন্ট টিপস (Junior Dev Checklist)

১. **Public ডিরেক্টরি সেটআপ:**
   - cPanel-এর মূল ডোমেইনের জন্য `public_html` ফোল্ডার রুট হিসেবে কাজ করে।
   - লারাভেলের `public/` ফোল্ডারের ফাইলগুলো `public_html`-এ এবং বাকি লারাভেল কোর ফাইলগুলো রুট ফোল্ডারের বাইরে (যেমন `earthquick_core/`) রাখা সবচেয়ে নিরাপদ।

২. **ডাটাবেজ কানেকশন (`.env`):**
   - cPanel MySQL Database Wizard থেকে ডাটাবেজ ও ইউজার তৈরি করে `.env`-এ `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` আপডেট করবেন।

৩. **প্রোডাকশন অপ্টিমাইজেশন কমান্ড:**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan storage:link
   ```

---

*এই গাইডটি অনুসরণ করলে কোনো বিভ্রান্তি ছাড়াই স্ট্যাটিক ফ্রন্টএন্ড থেকে একটি স্বয়ংসম্পূর্ণ, সুরক্ষিত ও গতিশীল লারাভেল ই-কমার্স অ্যাপ্লিকেশনে রূপান্তর করা সম্ভব হবে।*
