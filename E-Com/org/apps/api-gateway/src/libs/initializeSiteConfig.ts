import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const initializeSiteConfig = async () => {
    try {
        const existingConfig = await prisma.site_config.findFirst()
        if (!existingConfig) {
            await prisma.site_config.create({
                data: {
  categories: [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Books",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Toys & Games",
    "Automotive",
    "Groceries",
    "Health"
  ],
  subCategories: {
    "Electronics": [
      "Smartphones",
      "Feature Phones",
      "Tablets",
      "Laptops",
      "Desktops",
      "Monitors",
      "Headphones",
      "Speakers",
      "Cameras"
    ],
    "Clothing": [
      "Men",
      "Women",
      "Kids",
      "T-Shirts",
      "Shirts",
      "Jeans",
      "Dresses",
      "Ethnic Wear"
    ],
    "Home & Kitchen": [
      "Microwaves",
      "Refrigerators",
      "Mixers",
      "Sofas",
      "Beds",
      "Chairs",
      "Paintings",
      "Lamps",
      "Clocks"
    ],
    "Books": [
      "Fiction",
      "Non-Fiction",
      "Academic",
      "Comics",
      "Self-help",
      "English",
      "Hindi",
      "Spanish",
      "French"
    ],
    "Beauty & Personal Care": [
      "Moisturizers",
      "Cleansers",
      "Face Packs",
      "Shampoos",
      "Conditioners",
      "Hair Oils",
      "Lipsticks",
      "Foundation",
      "Mascaras"
    ],
    "Sports & Outdoors": [
      "Cricket",
      "Football",
      "Badminton",
      "Treadmills",
      "Yoga Mats",
      "Dumbbells"
    ],
    "Toys & Games": [
      "0-2 Years",
      "3-5 Years",
      "6-8 Years",
      "9-12 Years",
      "Educational Toys",
      "Remote Control Cars",
      "Puzzles"
    ],
    "Automotive": [
      "Seat Covers",
      "Dash Cameras",
      "Floor Mats",
      "Helmets",
      "Gloves",
      "Bike Covers"
    ],
    "Groceries": [
      "Rice",
      "Pulses",
      "Oils",
      "Snacks",
      "Tea",
      "Coffee",
      "Juices"
    ],
    "Health": [
      "Proteins",
      "Vitamins",
      "Ayurvedic",
      "Thermometers",
      "Oximeters",
      "First Aid"
    ]
                },
                logo: "https://ik.imagekit.io/Ueux/products/azuredragonscape.png",
  banner:"https://ik.imagekit.io/Ueux/products/azuredragonscape.png"
}
})
        }

    } catch (error) {
        console.log("Error initializing site config:",error)
    }
}

export default initializeSiteConfig