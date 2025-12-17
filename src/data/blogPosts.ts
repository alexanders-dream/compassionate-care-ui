export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "prevention" | "treatment" | "lifestyle" | "guides";
  author: string;
  date: string;
  readTime?: string;
  image?: string;
  imageUrl?: string; // Supabase uses image_url, context maps to imageUrl
  slug?: string;
  tags?: string[];
  publishedAt?: string;
  scheduledAt?: string;
  is_featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "understanding-chronic-wounds",
    title: "Understanding Chronic Wounds: Causes and Risk Factors",
    excerpt: "Learn about the common causes of chronic wounds and the risk factors that can slow healing, including diabetes, circulation issues, and more.",
    content: `
      <p>Chronic wounds are wounds that fail to heal within an expected timeframe, typically 4-6 weeks. Understanding the causes and risk factors can help you take preventive measures and seek appropriate treatment early.</p>
      
      <h2>Common Causes of Chronic Wounds</h2>
      <p>Several underlying conditions can lead to chronic wounds:</p>
      <ul>
        <li><strong>Diabetes:</strong> High blood sugar levels can damage blood vessels and nerves, reducing blood flow and sensation in the extremities.</li>
        <li><strong>Venous Insufficiency:</strong> When leg veins don't return blood efficiently to the heart, pressure builds up, leading to venous ulcers.</li>
        <li><strong>Arterial Disease:</strong> Narrowed arteries reduce blood flow to tissues, particularly in the legs and feet.</li>
        <li><strong>Pressure:</strong> Prolonged pressure on skin, especially over bony areas, can cause pressure ulcers (bedsores).</li>
      </ul>
      
      <h2>Risk Factors</h2>
      <p>Several factors can increase your risk of developing chronic wounds:</p>
      <ul>
        <li>Age over 65</li>
        <li>Obesity</li>
        <li>Smoking</li>
        <li>Poor nutrition</li>
        <li>Immobility</li>
        <li>Compromised immune system</li>
      </ul>
      
      <h2>When to Seek Help</h2>
      <p>If you have a wound that isn't healing after 2-3 weeks, or shows signs of infection (increased redness, swelling, drainage, or fever), contact a wound care specialist immediately.</p>
    `,
    category: "guides",
    author: "Dr. Sarah Mitchell",
    date: "2024-12-01",
    readTime: "5 min read"
  },
  {
    id: "diabetic-foot-care-tips",
    title: "Essential Diabetic Foot Care: Daily Habits That Prevent Wounds",
    excerpt: "Discover daily foot care practices that can help people with diabetes prevent serious foot complications and wounds.",
    content: `
      <p>For people living with diabetes, proper foot care isn't just about comfort—it's essential for preventing serious complications that could lead to hospitalization or amputation.</p>
      
      <h2>Daily Foot Inspection</h2>
      <p>Check your feet every day for:</p>
      <ul>
        <li>Cuts, blisters, or sores</li>
        <li>Redness or swelling</li>
        <li>Changes in skin color or temperature</li>
        <li>Ingrown toenails</li>
        <li>Corns or calluses</li>
      </ul>
      
      <h2>Proper Foot Hygiene</h2>
      <p>Follow these daily care steps:</p>
      <ol>
        <li>Wash feet daily with lukewarm water (test with elbow first)</li>
        <li>Dry thoroughly, especially between toes</li>
        <li>Apply moisturizer to prevent cracking, but not between toes</li>
        <li>Trim toenails straight across</li>
        <li>Never walk barefoot, even indoors</li>
      </ol>
      
      <h2>Choosing the Right Footwear</h2>
      <p>Proper shoes are crucial for diabetic foot protection. Look for shoes that:</p>
      <ul>
        <li>Have a wide, deep toe box</li>
        <li>Provide good arch support</li>
        <li>Are made of breathable materials</li>
        <li>Have no internal seams that could cause irritation</li>
      </ul>
    `,
    category: "prevention",
    author: "Maria Rodriguez, RN",
    date: "2024-11-28",
    readTime: "6 min read"
  },
  {
    id: "wound-dressing-basics",
    title: "Wound Dressing 101: Types and When to Use Them",
    excerpt: "A comprehensive guide to different types of wound dressings and how to choose the right one for optimal healing.",
    content: `
      <p>Choosing the right wound dressing is crucial for proper healing. Different wounds require different types of dressings based on the wound type, location, and stage of healing.</p>
      
      <h2>Common Types of Wound Dressings</h2>
      
      <h3>Hydrocolloid Dressings</h3>
      <p>Best for: Minor burns, pressure ulcers, venous ulcers</p>
      <p>These dressings create a moist environment and are waterproof, making them ideal for wounds that need protection during daily activities.</p>
      
      <h3>Foam Dressings</h3>
      <p>Best for: Wounds with moderate to heavy drainage</p>
      <p>Highly absorbent and provide cushioning, making them excellent for pressure relief.</p>
      
      <h3>Alginate Dressings</h3>
      <p>Best for: Heavily draining wounds</p>
      <p>Made from seaweed, these dressings can absorb 15-20 times their weight in fluid.</p>
      
      <h3>Transparent Film Dressings</h3>
      <p>Best for: Minor wounds, IV sites, as secondary dressings</p>
      <p>Allow visual monitoring of the wound while protecting it from bacteria and moisture.</p>
      
      <h2>When to Change Your Dressing</h2>
      <p>Dressings should typically be changed when:</p>
      <ul>
        <li>They become saturated</li>
        <li>They start to come loose</li>
        <li>At recommended intervals (varies by type)</li>
        <li>If you notice signs of infection</li>
      </ul>
    `,
    category: "treatment",
    author: "Dr. James Chen",
    date: "2024-11-22",
    readTime: "7 min read"
  },
  {
    id: "nutrition-for-wound-healing",
    title: "Nutrition That Heals: Foods That Support Wound Recovery",
    excerpt: "Discover how proper nutrition can accelerate wound healing and which foods to include in your diet during recovery.",
    content: `
      <p>What you eat plays a significant role in how quickly and effectively your wounds heal. Proper nutrition provides the building blocks your body needs to repair damaged tissue.</p>
      
      <h2>Key Nutrients for Wound Healing</h2>
      
      <h3>Protein</h3>
      <p>Essential for tissue repair and immune function. Aim for 1.25-1.5g of protein per kg of body weight daily during wound healing.</p>
      <p>Sources: Lean meats, fish, eggs, dairy, legumes, nuts</p>
      
      <h3>Vitamin C</h3>
      <p>Crucial for collagen synthesis and immune function.</p>
      <p>Sources: Citrus fruits, strawberries, bell peppers, broccoli</p>
      
      <h3>Zinc</h3>
      <p>Supports protein synthesis and cell division.</p>
      <p>Sources: Meat, shellfish, legumes, seeds, nuts</p>
      
      <h3>Vitamin A</h3>
      <p>Important for epithelial tissue development and immune function.</p>
      <p>Sources: Sweet potatoes, carrots, leafy greens, eggs</p>
      
      <h2>Hydration Matters</h2>
      <p>Adequate fluid intake is essential for wound healing. Aim for at least 8 glasses of water daily, more if you're healing from a significant wound.</p>
      
      <h2>Foods to Limit</h2>
      <p>During wound healing, try to reduce:</p>
      <ul>
        <li>Excessive sugar (can impair immune function)</li>
        <li>Alcohol (can delay healing)</li>
        <li>Highly processed foods (low in nutrients)</li>
      </ul>
    `,
    category: "lifestyle",
    author: "Emily Thompson, RD",
    date: "2024-11-15",
    readTime: "5 min read"
  },
  {
    id: "pressure-ulcer-prevention",
    title: "Preventing Pressure Ulcers: A Caregiver's Guide",
    excerpt: "Learn essential techniques for preventing pressure ulcers in bedridden or mobility-limited patients.",
    content: `
      <p>Pressure ulcers, also known as bedsores, are a serious concern for patients with limited mobility. With proper prevention strategies, most pressure ulcers can be avoided.</p>
      
      <h2>Understanding Pressure Points</h2>
      <p>Pressure ulcers typically develop over bony prominences:</p>
      <ul>
        <li>Heels and ankles</li>
        <li>Hips and tailbone</li>
        <li>Shoulder blades</li>
        <li>Back of the head</li>
        <li>Elbows</li>
      </ul>
      
      <h2>Prevention Strategies</h2>
      
      <h3>Regular Repositioning</h3>
      <p>Reposition bedridden patients every 2 hours and wheelchair users every 15-30 minutes. Use pillows or foam wedges to keep bony areas from touching.</p>
      
      <h3>Skin Care</h3>
      <ul>
        <li>Keep skin clean and dry</li>
        <li>Use moisture-barrier creams for incontinence</li>
        <li>Inspect skin daily for early warning signs</li>
        <li>Avoid massage over bony prominences</li>
      </ul>
      
      <h3>Support Surfaces</h3>
      <p>Consider specialized mattresses or overlays that redistribute pressure. Options include foam, air, or gel-based surfaces.</p>
      
      <h2>Early Warning Signs</h2>
      <p>Watch for these early indicators:</p>
      <ul>
        <li>Skin that doesn't blanch when pressed</li>
        <li>Red, purple, or discolored areas</li>
        <li>Skin that feels different (warmer, cooler, harder)</li>
        <li>Pain or itching in an area</li>
      </ul>
    `,
    category: "prevention",
    author: "Linda Garcia, RN",
    date: "2024-11-10",
    readTime: "6 min read"
  },
  {
    id: "signs-of-wound-infection",
    title: "Recognizing Signs of Wound Infection: When to Seek Help",
    excerpt: "Learn to identify the warning signs of wound infection and understand when professional medical care is needed.",
    content: `
      <p>Knowing how to recognize a wound infection early can prevent serious complications. Here's what to watch for and when to seek professional care.</p>
      
      <h2>Normal Healing vs. Infection</h2>
      <p>Some inflammation is normal during wound healing. However, certain signs indicate possible infection that requires attention.</p>
      
      <h2>Warning Signs of Infection</h2>
      
      <h3>Local Signs</h3>
      <ul>
        <li><strong>Increasing redness</strong> that spreads beyond the wound edges</li>
        <li><strong>Swelling</strong> that worsens over time</li>
        <li><strong>Increased pain</strong> or tenderness</li>
        <li><strong>Warmth</strong> around the wound</li>
        <li><strong>Pus or discharge</strong> that is yellow, green, or foul-smelling</li>
        <li><strong>Red streaks</strong> extending from the wound</li>
      </ul>
      
      <h3>Systemic Signs</h3>
      <ul>
        <li>Fever over 100.4°F (38°C)</li>
        <li>Chills</li>
        <li>Fatigue or feeling unwell</li>
        <li>Swollen lymph nodes</li>
      </ul>
      
      <h2>When to Seek Immediate Care</h2>
      <p>Contact a healthcare provider immediately if you experience:</p>
      <ul>
        <li>High fever</li>
        <li>Rapidly spreading redness</li>
        <li>Severe pain</li>
        <li>Large amounts of pus</li>
        <li>Signs of blood poisoning (red streaks, confusion, rapid heartbeat)</li>
      </ul>
    `,
    category: "guides",
    author: "Dr. Sarah Mitchell",
    date: "2024-11-05",
    readTime: "4 min read"
  }
];

export const categories = [
  { id: "all", label: "All Articles" },
  { id: "prevention", label: "Prevention" },
  { id: "treatment", label: "Treatment" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "guides", label: "Guides" }
] as const;
