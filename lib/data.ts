import { Product, CategoryConfig, HeroSlide } from './types';

// Dummy / seed category identifiers used to purge mock data from Firestore
export const DUMMY_CATEGORY_NAMES = [
  'brochures & booklets',
  'canopies & gazebos',
  'flyers & leaflets',
  'hoodies & sweatshirts',
  'id cards & lanyards',
  'notebooks & diaries',
  'personalised mugs',
  'polo shirts',
  'posters & signs',
  'promotional pens',
  'pvc banners',
  'stickers & labels',
  't-shirts',
  'tote bags',
  'water bottles',
  'workwear & high-vis',
  'roller banners',
  'business cards',
  'gift items',
  'printing',
  'clothing',
];

export const DUMMY_PRODUCT_IDS = [
  'gift-ceramic-mug-01',
  'gift-magic-color-mug-02',
  'gift-engraved-metal-pen-01',
  'gift-soft-touch-pens-02',
  'gift-stainless-water-bottle-01',
];

// No default mock categories - catalog is purely managed via CMS & Firestore
export const INITIAL_CATEGORIES: CategoryConfig[] = [];

// No default mock products - products are purely managed via CMS & Firestore
export const SEED_PRODUCTS: Product[] = [];

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [];

export const DEFAULT_ARTWORK_GUIDES = [
  {
    id: 'guide-bleed-trim-safe-zones',
    title: 'Bleed, Trim & Safe Zones Explained',
    slug: 'bleed-trim-safe-zones',
    shortDescription: 'Learn why 3mm bleed and 5mm safe zones are essential to prevent unsightly white edges and accidental cutoff of your design.',
    category: 'Artwork Setup',
    readingTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    order: 1,
    content: `<h2>Understanding Print Dimensions</h2>
<p>When creating artwork for commercial digital printing, you cannot simply design to the exact finished size of the product. Industrial guillotines cut through hundreds of sheets at once, which requires built-in tolerances known as <strong>Bleed</strong>, <strong>Trim Line</strong>, and <strong>Safe Zone</strong>.</p>

<h3>1. What is Bleed?</h3>
<p>Bleed is the artwork area that extends beyond the final cut line of the document. At Print Today UK, we require a minimum of <strong>3mm bleed on all four sides</strong> of your artwork.</p>
<ul>
  <li><strong>Why it matters:</strong> Without bleed, even the slightest shifting of the paper (0.5mm) during guillotine cutting will leave an unsightly white border along the edge of your finished flyers or business cards.</li>
  <li><strong>How to apply:</strong> If your background has color, photos, or patterns touching the edge, stretch them 3mm past the canvas border into the bleed area.</li>
</ul>

<h3>2. The Trim Line</h3>
<p>The trim line is the actual target boundary where the final printed piece is cut. For example:</p>
<ol>
  <li><strong>A5 Finished Size:</strong> 148 × 210 mm</li>
  <li><strong>A5 with 3mm Bleed:</strong> 154 × 216 mm (148 + 6mm width, 210 + 6mm height)</li>
  <li><strong>Standard Business Card:</strong> 85 × 55 mm finished (91 × 61 mm with bleed)</li>
</ol>

<h3>3. The Safe Zone (Quiet Area)</h3>
<p>Keep all important elements — such as text, logos, telephone numbers, and QR codes — at least <strong>5mm inside the trim line</strong>.</p>
<ul>
  <li>Guillotine blades have minor natural drift during stack cutting.</li>
  <li>Any text closer than 5mm to the cut edge risks looking crowded or being sliced off.</li>
</ul>

<blockquote><strong>Pro Tip:</strong> In Adobe Illustrator or InDesign, go to <em>File &gt; Document Setup</em> and set Bleed to <strong>3mm</strong> on Top, Bottom, Left, and Right. When exporting your print PDF, check <em>Marks and Bleeds &gt; Use Document Bleed Settings</em>.</blockquote>`,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
  },
  {
    id: 'guide-resolution-dpi-print',
    title: 'Resolution & Image Quality: 300 DPI vs 72 DPI',
    slug: 'resolution-dpi-print-guide',
    shortDescription: 'Understand why high-resolution 300 DPI is required for razor-sharp commercial print output instead of blurry pixelated web images.',
    category: 'Image Quality',
    readingTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    order: 2,
    content: `<h2>Why Screen Resolution is Not Enough for Print</h2>
<p>One of the most common reasons files fail preflight inspection is <strong>low image resolution</strong>. Digital screens look vibrant at 72 or 96 DPI (Dots Per Inch), but professional printing presses require <strong>300 DPI</strong> to produce crisp, legible text and high-definition photographs.</p>

<h3>What Happens When You Print 72 DPI?</h3>
<p>When a 72 DPI web image is printed, the printer has to stretch each pixel across multiple physical ink dots. This results in:</p>
<ul>
  <li>Fuzzy, blocky, and pixelated images</li>
  <li>Blurry text and illegible contact details</li>
  <li>Distorted logos and loss of professional credibility</li>
</ul>

<h3>Vector vs. Raster Graphics</h3>
<ol>
  <li><strong>Vector Graphics (.AI, .EPS, .SVG, Vector PDF):</strong> Composed of mathematical lines and curves. Vectors can scale infinitely to the size of a billboard with zero loss in sharpness. Always keep your logos and typography as vector!</li>
  <li><strong>Raster Images (.JPG, .PNG, .TIFF):</strong> Composed of fixed pixels. Raster photos must be captured and placed at <strong>300 DPI at 100% printed scale</strong>.</li>
</ol>

<h3>Checking Resolution in Photoshop &amp; Acrobat</h3>
<ul>
  <li>In Adobe Photoshop: Go to <strong>Image &gt; Image Size</strong>. Verify that Resolution is set to 300 Pixels/Inch without resample.</li>
  <li>In Adobe Acrobat: Use the <strong>Output Preview</strong> or <strong>Preflight</strong> tool to audit embedded raster images.</li>
</ul>

<blockquote><strong>Warning:</strong> You cannot increase image quality simply by typing &ldquo;300&rdquo; into an existing low-res 72 DPI web image. Upscaling creates artificial pixel interpolation that still looks blurry on paper. Always supply the original camera file or raw high-res asset.</blockquote>`,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now(),
  },
  {
    id: 'guide-cmyk-vs-rgb-color',
    title: 'CMYK vs RGB: Why Screen Colors Differ From Print',
    slug: 'cmyk-vs-rgb-color-guide',
    shortDescription: 'Discover why neon screen RGB colours look dull when converted to CMYK ink and how to set up rich blacks for stunning print.',
    category: 'Color & Inks',
    readingTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    order: 3,
    content: `<h2>The Science Behind Color Models</h2>
<p>Have you ever designed an eye-catching neon brochure on your monitor, only to have the physical printed copy look significantly darker and less vibrant? This happens because digital displays and physical printers use two entirely different color spaces.</p>

<h3>1. RGB (Additive Color Mode)</h3>
<p>RGB stands for <strong>Red, Green, Blue</strong>. Computer screens, mobile phones, and digital cameras emit light directly to your eyes. Combining Red, Green, and Blue light at full intensity creates pure white light. This allows monitors to display ultra-bright neon greens, vivid blues, and luminous magentas that do not exist in the physical ink spectrum.</p>

<h3>2. CMYK (Subtractive Color Mode)</h3>
<p>CMYK stands for <strong>Cyan, Magenta, Yellow, Key (Black)</strong>. Physical printing processes apply microscopic dots of four ink pigments onto white paper. Paper absorbs (subtracts) light waves and reflects the rest to your eyes. Because CMYK depends on physical ink reflection, its color gamut is narrower than RGB.</p>

<h3>How to Avoid Color Shifts</h3>
<ul>
  <li><strong>Design in CMYK from the start:</strong> In Illustrator, Photoshop, or InDesign, select <em>Color Mode: CMYK</em> before beginning your artwork.</li>
  <li><strong>Convert RGB photos before export:</strong> Review color shifts in your design software rather than having the RIP processor do an automatic conversion on the press.</li>
  <li><strong>Standard Print Profile:</strong> Use <strong>Coated FOGRA39</strong> or <strong>ISO Coated v2</strong> for standard UK printing.</li>
</ul>

<h3>The Secret to Rich Black (Deep Contrast Black)</h3>
<p>If you use 100% Black (K=100%, C=0%, M=0%, Y=0%) for large background areas, the paper will absorb the single ink layer and appear as a dull dark grey. For rich, punchy luxury blacks on heavy backgrounds, use:</p>
<ol>
  <li><strong>Cyan:</strong> 40%</li>
  <li><strong>Magenta:</strong> 30%</li>
  <li><strong>Yellow:</strong> 30%</li>
  <li><strong>Black (Key):</strong> 100%</li>
  <li><strong>Total Ink Coverage:</strong> 200% (well below the maximum safe limit of 300%)</li>
</ol>

<blockquote><strong>Important:</strong> For small body text (under 14pt), always use <strong>100% K only</strong> (C=0, M=0, Y=0, K=100) to ensure crystal-sharp letter edges without registration haloing.</blockquote>`,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'guide-print-ready-pdf-checklist',
    title: 'Print-Ready PDF Checklist: Step-by-Step Guide',
    slug: 'print-ready-pdf-checklist',
    shortDescription: 'A complete preflight checklist to verify your PDF file before submitting it to press: outlined fonts, 3mm bleed, and vector standards.',
    category: 'File Preparation',
    readingTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    order: 4,
    content: `<h2>10-Point Preflight Artwork Checklist</h2>
<p>Before uploading your file for same-day or next-day printing in London, run through this comprehensive preflight checklist to guarantee your job moves straight into production without delays.</p>

<h3>Essential Checklist</h3>
<ol>
  <li><strong>File Format:</strong> Export your artwork as a <strong>High Quality Print PDF</strong> (preferably PDF/X-1a:2001 or PDF/X-4).</li>
  <li><strong>Dimensions:</strong> Double-check the document width and height match the required UK paper size (A6, A5, A4, A3, etc.).</li>
  <li><strong>3mm Bleed:</strong> Confirm 3mm extra background extends outside all four trim edges.</li>
  <li><strong>5mm Safe Margin:</strong> Keep text, phone numbers, and badges at least 5mm away from the cut line.</li>
  <li><strong>Fonts Outlined:</strong> Convert all text to outlines/curves (<em>Ctrl+Shift+O</em> / <em>Cmd+Shift+O</em>) so non-standard fonts never substitute or drop characters.</li>
  <li><strong>Color Mode:</strong> All colors and photos converted to <strong>CMYK</strong> (no RGB or Pantone spot colors unless ordering spot Pantone jobs).</li>
  <li><strong>Resolution:</strong> All raster photos and placed graphics set to <strong>300 DPI</strong> at full scale.</li>
  <li><strong>Rich Black vs Pure Black:</strong> Use 40/30/30/100 for large dark fills, and 0/0/0/100 for small body text.</li>
  <li><strong>Single Pages:</strong> For multi-page brochures, supply pages in numerical order as single pages, not printer spreads.</li>
  <li><strong>No Printer Marks Required:</strong> You do not need to include manual crop marks or color bars as our automated workflow software adds dynamic digital registration marks.</li>
</ol>

<blockquote><strong>Need Free Artwork Preflight?</strong> Send your files to <a href="mailto:artwork@printtodayuk.com">artwork@printtodayuk.com</a> and our London prepress studio will inspect your artwork free of charge.</blockquote>`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'guide-roller-banner-setup',
    title: 'Roller Banner Artwork Dimensions & Setup Guide',
    slug: 'roller-banner-artwork-setup',
    shortDescription: 'Exact dimensions, resolution guidelines, and cassette allowances for 800mm, 850mm, 1000mm, and 1200mm pull-up roller banners.',
    category: 'Large Format',
    readingTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    isPublished: true,
    order: 5,
    content: `<h2>Standard Roller Banner Sizing &amp; Cassette Allowance</h2>
<p>Pull-up roller banners are among London&rsquo;s most popular marketing display solutions for exhibitions, corporate receptions, conferences, and retail promotions. Setting up the artwork correctly prevents critical content from getting trapped inside the metal floor cassette.</p>

<h3>Standard UK Banner Sizes</h3>
<ul>
  <li><strong>Standard Width:</strong> 800mm × 2000mm (Finished Visual Area)</li>
  <li><strong>Wide Standard:</strong> 850mm × 2000mm</li>
  <li><strong>Executive Banner:</strong> 1000mm × 2000mm</li>
  <li><strong>Extra Wide Display:</strong> 1200mm × 2000mm</li>
  <li><strong>Giant Backdrop:</strong> 1500mm or 2000mm × 2000mm</li>
</ul>

<h3>The 150mm Bottom Cassette Rule</h3>
<p>Roller banners operate via an internal spring-loaded roller mechanism located inside the aluminium base. To anchor the printed PVC/anti-curl banner securely to the roller mechanism:</p>
<ol>
  <li>The bottom <strong>150mm of your artwork</strong> will remain partially hidden inside the roller mechanism or sit right at floor level.</li>
  <li><strong>Do NOT place logos, QR codes, disclaimers, or text in the bottom 150mm</strong>.</li>
  <li>Continue your background color, image, or graphic all the way down through the extra 150mm so the banner looks seamless.</li>
</ol>

<h3>Total Document Setup for 800 × 2000mm Banner</h3>
<ul>
  <li><strong>Width:</strong> 800mm (plus 3mm bleed on each side = 806mm total)</li>
  <li><strong>Height:</strong> 2150mm (2000mm visual height + 150mm base bleed + 3mm top bleed = 2153mm total)</li>
  <li><strong>Recommended Resolution:</strong> 150 to 300 DPI at full size (or 300 DPI at 50% scale)</li>
</ul>

<blockquote><strong>Pro Tip:</strong> Place your main brand logo and key value proposition in the <strong>top third</strong> of the banner (between 1400mm and 2000mm from the floor) for maximum eye-level visibility in crowded exhibition halls.</blockquote>`,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
];

