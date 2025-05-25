
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Replace with your actual Supabase URL and anon key (or use env vars)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://umdeshfvysokfmkquivt.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZGVzaGZ2eXNva2Zta3F1aXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzE5NDgsImV4cCI6MjA2MzcwNzk0OH0.dRXTO1ti1487wi4lE3h_bTs4L7uInWX5B5pcRtcMtRs";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a random email (for the mock user) and a random password (for signup)
const randomEmail = `mockuser-${uuidv4()}@example.com`;
const randomPassword = "mockPassword123";

// Generate a random name (for a spending location) (using a list of "random" names)
const randomNames = [
  "Acme", "Buster's", "Café", "Diner", "Eatery", "Fusion", "Grocery", "Hangout", "Ice Cream", "Jazz", "Kiosk", "Lounge", "Market", "Nook", "Outpost", "Pizzeria", "Quick Stop", "Restaurant", "Store", "Taco", "Uptown", "Village", "Waffle", "Xpress", "Yum", "Zest"
];
function getRandomName() {
  const randomIndex = Math.floor(Math.random() * randomNames.length);
  return randomNames[randomIndex] + " " + Math.floor(Math.random() * 1000);
}

// Generate a random amount (≤ $500) (for "spending amount" (or "total spent"))
function getRandomAmount() {
  return +(Math.random() * 500).toFixed(2);
}

async function insertMockUser() {
  console.log("Inserting mock user (signup)…");
  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email: randomEmail, 
    password: randomPassword 
  });
  
  if (authError) {
    console.error("Error inserting mock user (signup):", authError);
    throw authError;
  }

  if (!authData?.user?.id) {
    console.error("No user ID returned from auth signup");
    throw new Error("No user ID returned from auth signup");
  }

  console.log("Auth user created with ID:", authData.user.id);

  // Create a record in the users table with all required fields
  const userRecord = { 
    id: authData.user.id,
    email: randomEmail,
    created_at: new Date().toISOString(),
    first_name: "Mock",
    last_name: "User",
    bank: "Test Bank",
    current_balance: 10000, // Starting balance of $10,000
    address: "123 Test Street, Test City, TS 12345",
    password: randomPassword // Note: This is just for the mock data
  };

  console.log("Attempting to create user record:", userRecord);

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([userRecord])
    .select()
    .single();

  if (userError) {
    console.error("Error creating user record:", userError);
    console.error("Error details:", {
      code: userError.code,
      message: userError.message,
      details: userError.details,
      hint: userError.hint
    });
    throw userError;
  }

  if (!userData) {
    console.error("No user data returned after insert");
    throw new Error("No user data returned after insert");
  }

  console.log("Mock user record created successfully:", userData);
  return userData;
}

async function insertMockSpendingLocations(userId) {
  console.log("Inserting mock spending locations (and spending amounts)…");
  const locations = [];
  // Reduce to 20 locations instead of 100
  for (let i = 0; i < 20; i++) {
    const location = {
       id: uuidv4(),
       name: getRandomName(),
       category: "Test",
       user_id: userId,
       created_at: new Date().toISOString() // Add created_at to match schema
    };
    locations.push(location);
  }
  const { data, error } = await supabase.from("spending_locations").insert(locations).select();
  if (error) {
    console.error("Error inserting mock spending locations:", error);
    throw error;
  }
  console.log("Mock spending locations inserted (count:", data.length, ").");

  // Insert spending amounts for each location
  const amounts = [];
  for (const loc of data) {
    // Add 1-3 spending amounts per location instead of just 1
    const numAmounts = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numAmounts; i++) {
      const amount = getRandomAmount();
      amounts.push({ 
        id: uuidv4(), 
        spending_location_id: loc.id,
        amount, 
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        description: null,
        created_at: new Date().toISOString() // Add created_at to match schema
      });
    }
  }
  const { data: amtData, error: amtError } = await supabase.from("spending_amounts").insert(amounts).select();
  if (amtError) {
    console.error("Error inserting mock spending amounts:", amtError);
    throw amtError;
  }
  console.log(`Mock spending amounts inserted (count: ${amtData.length}).`);
}

async function runTest() {
  try {
    console.log("Starting mock data insertion...");
    
    // Sign up the mock user
    const mockUser = await insertMockUser();
    console.log("Mock user created:", {
      id: mockUser.id,
      email: mockUser.email,
      auth_id: mockUser.id // This should match the auth user ID
    });

    // Insert spending locations and amounts
    await insertMockSpendingLocations(mockUser.id);
    
    // Verify the data was inserted
    console.log("Verifying data insertion...");
    const { data: locations, error: locError } = await supabase
      .from("spending_locations")
      .select()
      .eq("user_id", mockUser.id);
    
    if (locError) {
      console.error("Error verifying locations:", locError);
    } else {
      console.log(`Found ${locations.length} locations for user ${mockUser.id}`);
      
      // Check spending amounts for each location
      for (const loc of locations) {
        const { data: amounts, error: amtError } = await supabase
          .from("spending_amounts")
          .select()
          .eq("spending_location_id", loc.id);
        
        if (amtError) {
          console.error(`Error verifying amounts for location ${loc.id}:`, amtError);
        } else {
          console.log(`Location ${loc.name} has ${amounts.length} spending amounts`);
        }
      }
    }

    console.log(`Test complete. Mock user (email: ${randomEmail}) and spending data inserted.`);
    console.log("You can now log in with:");
    console.log("Email:", randomEmail);
    console.log("Password:", randomPassword);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest(); 