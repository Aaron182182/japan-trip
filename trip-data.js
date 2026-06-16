// Seed data for the trip. Everything here is just a starting point —
// edit, delete, or add to all of it from inside the app. Nothing here
// is re-read once you've made changes; your edits live in localStorage.

const DEFAULT_TRIP = {
  tripName: "Japan Trip 2026",
  startDate: "2026-10-12",
  currency: "JPY",
  jpyPerAud: 113, // 1 AUD = this many yen. Editable on the Budget tab.
  budgetInputCurrency: "JPY", // "JPY" or "AUD" — which currency you type budget amounts in.

  flights: [
    {
      id: "f1", label: "Outbound — Australia to Tokyo",
      airline: "", flightNumber: "",
      depAirport: "(Your home airport)", depDateTime: "2026-10-11T21:00",
      arrAirport: "Tokyo — Narita (NRT) or Haneda (HND)", arrDateTime: "2026-10-12T06:30",
      bookingRef: "", seats: "",
      notes: "Tap to add your real airline, flight number, exact times, terminal and seats. Times here are placeholders — overnight flights from the east coast typically land early morning."
    },
    {
      id: "f2", label: "Return — Tokyo to Australia",
      airline: "", flightNumber: "",
      depAirport: "Tokyo — Narita (NRT) or Haneda (HND)", depDateTime: "2026-10-25T10:00",
      arrAirport: "(Your home airport)", arrDateTime: "2026-10-25T21:00",
      bookingRef: "", seats: "",
      notes: "Placeholder times — update with your booked flight. Build the Day 14 airport transfer around this departure time."
    }
  ],

  transfers: [
    { id: "t1", date: "2026-10-12", time: "07:30", mode: "Private transfer", from: "Airport (NRT/HND)", to: "Toy Story Hotel", provider: "", bookingRef: "", cost: 0, notes: "Arrival transfer. Add provider + confirmation number once booked." },
    { id: "t2", date: "2026-10-15", time: "10:30", mode: "Private transfer", from: "Toy Story Hotel", to: "Tokyo Station", provider: "", bookingRef: "", cost: 0, notes: "To catch the Shinkansen to Osaka." },
    { id: "t3", date: "2026-10-15", time: "14:30", mode: "Private transfer", from: "Shin-Osaka Station", to: "The Park Front Hotel at USJ", provider: "", bookingRef: "", cost: 0, notes: "" },
    { id: "t4", date: "2026-10-18", time: "10:30", mode: "Private transfer", from: "The Park Front Hotel at USJ", to: "Shin-Osaka Station", provider: "", bookingRef: "", cost: 0, notes: "To catch the Shinkansen back to Tokyo." },
    { id: "t5", date: "2026-10-18", time: "14:30", mode: "Private transfer", from: "Tokyo Station", to: "Shibuya hotel", provider: "", bookingRef: "", cost: 0, notes: "" },
    { id: "t6", date: "2026-10-21", time: "11:00", mode: "Private transfer", from: "Shibuya hotel", to: "MIMARU Ueno Okachimachi", provider: "", bookingRef: "", cost: 0, notes: "" },
    { id: "t7", date: "2026-10-25", time: "07:00", mode: "Private transfer", from: "MIMARU Ueno Okachimachi", to: "Airport (NRT/HND)", provider: "", bookingRef: "", cost: 0, notes: "Departure transfer — time it to your return flight." }
  ],

  accommodation: [
    { id: "h1", name: "Tokyo Disney Resort Toy Story Hotel", address: "1-47 Maihama, Urayasu, Chiba 279-8511", checkIn: "2026-10-12", checkInTime: "15:00", checkOut: "2026-10-15", checkOutTime: "11:00", confirmationRef: "", cost: 0, confirmed: false, phone: "", email: "", website: "https://www.tokyodisneyresort.jp/en/hotel/tsh.html", notes: "Mobile check-in via the Tokyo Disney Resort app — you get a notification when the room is ready. Add your booking reference and the price you paid, then mark it Confirmed." },
    { id: "h2", name: "The Park Front Hotel at Universal Studios Japan", address: "6-2-52 Shimaya, Konohana-ku, Osaka 554-0024", checkIn: "2026-10-15", checkInTime: "15:00", checkOut: "2026-10-19", checkOutTime: "12:00", confirmationRef: "", cost: 0, confirmed: false, phone: "", email: "", website: "https://en.parkfront-hotel.com/", notes: "About a 1-minute walk to the USJ main gate. Add your booking reference and price." },
    { id: "h3", name: "Shibuya hotel (confirm exact name)", address: "Shibuya, Tokyo", checkIn: "2026-10-19", checkInTime: "15:00", checkOut: "2026-10-22", checkOutTime: "11:00", confirmationRef: "", cost: 0, confirmed: false, phone: "", email: "", website: "", notes: "Entered as \"Illi Mani\" from your earlier message — double-check the exact hotel name and address on your booking confirmation, update this card, then tap Search to pull up its contact details." },
    { id: "h4", name: "MIMARU Tokyo Ueno Okachimachi", address: "1-17-1 Ueno, Taito-ku, Tokyo 110-0005", checkIn: "2026-10-22", checkInTime: "15:00", checkOut: "2026-10-25", checkOutTime: "11:00", confirmationRef: "", cost: 0, confirmed: false, phone: "+81 3-5817-8335", email: "", website: "https://mimaruhotels.com/en/hotel/ueno-okachimachi/", notes: "Apartment-style room with a kitchen. Phone, address and website are pre-filled from public info — verify against your own booking." }
  ],

  activityBookings: [
    { id: "ab1", name: "Tokyo Disneyland 1-Day Passport", vendor: "Klook", date: "2026-10-13", time: "", voucherRef: "", cost: 0, confirmed: false, location: "Tokyo Disneyland", phone: "", website: "", klookUrl: "", notes: "If you booked this on Klook, paste the voucher code and the price you paid, then tap 🎟️ Klook to open your Klook bookings (sign in to Klook to see vouchers)." },
    { id: "ab2", name: "Tokyo DisneySea 1-Day Passport", vendor: "Klook", date: "2026-10-14", time: "", voucherRef: "", cost: 0, confirmed: false, location: "Tokyo DisneySea", phone: "", website: "", klookUrl: "", notes: "" },
    { id: "ab3", name: "Universal Studios Japan 1-Day Studio Pass", vendor: "Klook", date: "2026-10-16", time: "", voucherRef: "", cost: 0, confirmed: false, location: "Universal Studios Japan", phone: "", website: "", klookUrl: "", notes: "" }
  ],

  days: [
    {
      id: "d1", city: "Tokyo — Disney Resort", hotel: "Tokyo Disney Resort Toy Story Hotel",
      activities: [
        { id: "d1-a1", time: "11:00", category: "transport", title: "Airport transfer to Tokyo Disney Resort", location: "Narita or Haneda Airport to Maihama Station", notes: "The Disney Resort Cruiser limousine bus runs direct from both airports to the Disney hotels — easiest option with luggage and a kid in tow. Book seats ahead.", cost: 3200, kid: true },
        { id: "d1-a2", time: "15:00", category: "lodging", title: "Check in: Toy Story Hotel", location: "Tokyo Disney Resort Toy Story Hotel, Urayasu", notes: "Family rooms are themed around Andy's room. Hotel guests typically get an early-entry perk into the parks — confirm current terms at check-in.", cost: 0, kid: true },
        { id: "d1-a3", time: "18:00", category: "shopping", title: "Ikspiari & Bon Voyage souvenir store", location: "Ikspiari, Maihama", notes: "Big Disney store plus a full dining/shopping mall right at Maihama Station — an easy first-night stop.", cost: 5000, kid: true },
        { id: "d1-a4", time: "19:30", category: "food", title: "Dinner at Ikspiari", location: "Ikspiari, Maihama", notes: "Wide range of casual, family-friendly restaurants in one complex.", cost: 6000, kid: true }
      ]
    },
    {
      id: "d2", city: "Tokyo — Disney Resort", hotel: "Tokyo Disney Resort Toy Story Hotel",
      activities: [
        { id: "d2-a1", time: "08:00", category: "themepark", title: "Tokyo Disneyland — full day", location: "Tokyo Disneyland", notes: "Use the official app for ride wait times and priority entry passes. Popcorn bucket + character greeting are the must-dos with a kid.", cost: 9400, kid: true },
        { id: "d2-a2", time: "13:00", category: "food", title: "Lunch in the park", location: "Tokyo Disneyland", notes: "Polynesian Terrace or Pan Galactic Pizza Port are solid family picks.", cost: 4000, kid: true },
        { id: "d2-a3", time: "20:00", category: "culture", title: "Evening parade / fireworks (seasonal)", location: "Tokyo Disneyland", notes: "Check the daily entertainment schedule on arrival — night shows vary by season.", cost: 0, kid: true }
      ]
    },
    {
      id: "d3", city: "Tokyo — Disney Resort", hotel: "Tokyo Disney Resort Toy Story Hotel",
      activities: [
        { id: "d3-a1", time: "08:00", category: "themepark", title: "Tokyo DisneySea — full day", location: "Tokyo DisneySea", notes: "Fantasy Springs (Frozen / Tangled / Peter Pan area) draws big crowds — go for a virtual queue or priority pass the moment the park opens.", cost: 9400, kid: true },
        { id: "d3-a2", time: "13:00", category: "food", title: "Lunch — Cape Cod or American Waterfront", location: "Tokyo DisneySea", notes: "", cost: 4000, kid: true },
        { id: "d3-a3", time: "17:00", category: "nature", title: "Mediterranean Harbor stroll", location: "Tokyo DisneySea", notes: "Slower-paced area — good for a tired kid. Gondola rides if running.", cost: 0, kid: true }
      ]
    },
    {
      id: "d4", city: "Tokyo → Osaka (travel day)", hotel: "The Park Front Hotel at Universal Studios Japan",
      activities: [
        { id: "d4-a1", time: "10:00", category: "lodging", title: "Check out: Toy Story Hotel", location: "Tokyo Disney Resort Toy Story Hotel", notes: "", cost: 0, kid: false },
        { id: "d4-a2", time: "11:30", category: "transport", title: "Shinkansen to Shin-Osaka", location: "Tokyo Station to Shin-Osaka Station", notes: "Nozomi is fastest at ~2h25m. Reserve seats ahead, especially with a child and luggage. Consider a same-day luggage forwarding (takkyubin) service so you're not hauling bags through the station.", cost: 14000, kid: true },
        { id: "d4-a3", time: "15:00", category: "lodging", title: "Check in: The Park Front Hotel at Universal Studios Japan", location: "The Park Front Hotel at Universal Studios Japan, Osaka", notes: "About a 1-minute walk to the USJ gate — as convenient as it gets.", cost: 0, kid: true },
        { id: "d4-a4", time: "18:00", category: "shopping", title: "Universal CityWalk Osaka + Donguri Republic", location: "Universal CityWalk Osaka", notes: "Donguri Republic is the Studio Ghibli store — worth a look even on a travel day.", cost: 4000, kid: true }
      ]
    },
    {
      id: "d5", city: "Osaka", hotel: "The Park Front Hotel at Universal Studios Japan",
      activities: [
        { id: "d5-a1", time: "08:30", category: "themepark", title: "Universal Studios Japan — full day", location: "Universal Studios Japan", notes: "Super Nintendo World and Minion Park are the big kid draws. Official hotel guests often get an early-entry window for Super Nintendo World — confirm the current perk and time at check-in.", cost: 9800, kid: true },
        { id: "d5-a2", time: "13:00", category: "food", title: "Lunch — Mario Cafe & Store or Discovery Restaurant", location: "Universal Studios Japan", notes: "", cost: 4500, kid: true },
        { id: "d5-a3", time: "19:30", category: "food", title: "Dinner at CityWalk", location: "Universal CityWalk Osaka", notes: "", cost: 5000, kid: true }
      ]
    },
    {
      id: "d6", city: "Osaka", hotel: "The Park Front Hotel at Universal Studios Japan",
      activities: [
        { id: "d6-a1", time: "09:30", category: "popculture", title: "Pokémon Center Osaka DX", location: "Pokémon Center Osaka DX, Daimaru Shinsaibashi", notes: "9th floor of Daimaru Shinsaibashi — this DX location also has a Pokémon-themed café.", cost: 6000, kid: true },
        { id: "d6-a2", time: "11:30", category: "shopping", title: "Dotonbori & Shinsaibashi-suji", location: "Dotonbori, Osaka", notes: "Glico sign photo stop, takoyaki and kuidaore street food, endless covered shopping arcade.", cost: 5000, kid: true },
        { id: "d6-a3", time: "13:00", category: "food", title: "Lunch at Kuromon Ichiba Market", location: "Kuromon Ichiba Market, Osaka", notes: "Stand-and-eat seafood, wagyu skewers, fruit — a good grazing lunch for a family.", cost: 5000, kid: true },
        { id: "d6-a4", time: "15:30", category: "culture", title: "Osaka Castle Park", location: "Osaka Castle, Osaka", notes: "The grounds alone are an easy, scenic walk with a kid, even skipping the museum inside the keep.", cost: 600, kid: true },
        { id: "d6-a5", time: "18:00", category: "golf", title: "Browse used golf shops (optional)", location: "Namba / Shinsaibashi, Osaka", notes: "This area has several second-hand golf retailers worth a wander. For a guaranteed flagship destination, see Mizuno Tokyo on Day 13.", cost: 0, kid: false }
      ]
    },
    {
      id: "d7", city: "Nara + Kyoto (day trip from Osaka)", hotel: "The Park Front Hotel at Universal Studios Japan",
      activities: [
        { id: "d7-a1", time: "08:30", category: "transport", title: "Train to Nara", location: "Osaka to Nara Station", notes: "JR Yamatoji Line, direct, about 45 minutes.", cost: 1200, kid: true },
        { id: "d7-a2", time: "09:30", category: "nature", title: "Nara Park — feed the deer", location: "Nara Park, Nara", notes: "Buy 'shika senbei' deer crackers from vendors. Likely one of the best kid moments of the whole trip.", cost: 1500, kid: true },
        { id: "d7-a3", time: "11:00", category: "culture", title: "Todai-ji Temple", location: "Todai-ji Temple, Nara", notes: "Home to the Great Buddha — the sheer scale wows kids.", cost: 1200, kid: true },
        { id: "d7-a4", time: "13:00", category: "food", title: "Lunch in Nara", location: "Naramachi, Nara", notes: "", cost: 4000, kid: true },
        { id: "d7-a5", time: "14:30", category: "transport", title: "Train to Fushimi Inari (via Kyoto)", location: "Nara to Inari Station", notes: "JR Nara Line, roughly 45-50 minutes.", cost: 1000, kid: true },
        { id: "d7-a6", time: "15:30", category: "culture", title: "Fushimi Inari Shrine", location: "Fushimi Inari Taisha, Kyoto", notes: "Thousands of vermillion torii gates. The full hike up Mt. Inari takes 2-3 hours — with a kid, just do the lower gates (first 20-30 min) for the iconic photos.", cost: 0, kid: true },
        { id: "d7-a7", time: "18:00", category: "transport", title: "Train back to Osaka", location: "Kyoto/Inari to Osaka", notes: "Long day of trains — pack snacks, a charged tablet, and something to keep a tired kid occupied.", cost: 1500, kid: true }
      ]
    },
    {
      id: "d8", city: "Osaka → Tokyo (travel day)", hotel: "Shibuya hotel (confirm exact name — entered as \"Illi Mani\")",
      activities: [
        { id: "d8-a1", time: "10:00", category: "lodging", title: "Check out: Park Front Hotel", location: "The Park Front Hotel at Universal Studios Japan", notes: "", cost: 0, kid: false },
        { id: "d8-a2", time: "11:30", category: "transport", title: "Shinkansen to Tokyo", location: "Shin-Osaka Station to Tokyo Station", notes: "Nozomi, ~2h25m. Reserve seats, and consider forwarding the bulk of your luggage ahead to the Shibuya hotel.", cost: 14000, kid: true },
        { id: "d8-a3", time: "15:00", category: "lodging", title: "Check in: Shibuya hotel", location: "Shibuya, Tokyo", notes: "Entered as \"Illi Mani\" from your message — double-check the exact hotel name and address in your booking confirmation and correct this card.", cost: 0, kid: true },
        { id: "d8-a4", time: "18:00", category: "culture", title: "Shibuya Sky + Shibuya Scramble Crossing", location: "Shibuya Sky, Tokyo", notes: "Book Shibuya Sky tickets ahead for a sunset slot, then watch the famous crossing from street level after.", cost: 2200, kid: true },
        { id: "d8-a5", time: "19:30", category: "food", title: "Dinner in Shibuya", location: "Shibuya, Tokyo", notes: "", cost: 6000, kid: true }
      ]
    },
    {
      id: "d9", city: "Tokyo — Shibuya", hotel: "Shibuya hotel",
      activities: [
        { id: "d9-a1", time: "10:00", category: "popculture", title: "Shibuya PARCO: Nintendo TOKYO + Pokémon Center Shibuya", location: "Shibuya PARCO, Tokyo", notes: "Nintendo TOKYO, Pokémon Center Shibuya, Jump Shop and Capcom Store are all in the same building — an efficient one-stop pop-culture morning.", cost: 8000, kid: true },
        { id: "d9-a2", time: "13:00", category: "food", title: "Lunch in Shibuya", location: "Shibuya, Tokyo", notes: "", cost: 5000, kid: true },
        { id: "d9-a3", time: "14:30", category: "shopping", title: "Harajuku Takeshita Street", location: "Takeshita Street, Harajuku", notes: "Crepes, kawaii shops, people-watching — a short walk from Shibuya.", cost: 4000, kid: true },
        { id: "d9-a4", time: "16:30", category: "nature", title: "Meiji Jingu Shrine forest walk", location: "Meiji Jingu, Tokyo", notes: "A genuinely peaceful forest in the middle of the city — good decompression after shopping.", cost: 0, kid: true }
      ]
    },
    {
      id: "d10", city: "Tokyo — Odaiba", hotel: "Shibuya hotel",
      activities: [
        { id: "d10-a1", time: "10:00", category: "popculture", title: "DiverCity Tokyo Plaza — Unicorn Gundam statue", location: "DiverCity Tokyo Plaza, Odaiba", notes: "The life-size Gundam statue runs light/sound shows at set times — check the schedule on arrival.", cost: 0, kid: true },
        { id: "d10-a2", time: "11:30", category: "culture", title: "LEGOLAND Discovery Center Tokyo", location: "LEGOLAND Discovery Center, Odaiba", notes: "Indoor and air-conditioned, built for younger kids — a good mid-trip pace-changer.", cost: 3000, kid: true },
        { id: "d10-a3", time: "14:00", category: "culture", title: "teamLab digital art exhibit", location: "teamLab, Tokyo", notes: "teamLab's Tokyo venue has moved before (Borderless/Planets have been at Toyosu and Azabudai Hills) — confirm the current location and book timed tickets before you go.", cost: 4000, kid: true },
        { id: "d10-a4", time: "18:00", category: "food", title: "Waterfront dinner with Rainbow Bridge views", location: "Odaiba, Tokyo", notes: "", cost: 6000, kid: true }
      ]
    },
    {
      id: "d11", city: "Tokyo — Ueno", hotel: "MIMARU Tokyo Ueno Okachimachi",
      activities: [
        { id: "d11-a1", time: "10:00", category: "lodging", title: "Check out: Shibuya hotel", location: "Shibuya, Tokyo", notes: "", cost: 0, kid: false },
        { id: "d11-a2", time: "11:00", category: "transport", title: "Train to Ueno", location: "Shibuya to Ueno Station", notes: "Yamanote Line, direct, about 25 minutes — no taxi needed.", cost: 600, kid: true },
        { id: "d11-a3", time: "12:30", category: "lodging", title: "Check in: MIMARU Tokyo Ueno Okachimachi", location: "MIMARU Tokyo Ueno Okachimachi", notes: "Apartment-style room with its own kitchen — handy for a simple breakfast or reheating leftovers with a kid.", cost: 0, kid: true },
        { id: "d11-a4", time: "14:00", category: "nature", title: "Ueno Zoo", location: "Ueno Zoo, Tokyo", notes: "Home to giant pandas — usually the headline request from kids in Tokyo.", cost: 600, kid: true },
        { id: "d11-a5", time: "16:30", category: "shopping", title: "Ameyoko Market", location: "Ameyoko, Ueno", notes: "Lively market street between Ueno and Okachimachi stations — good for snacks and cheap souvenirs.", cost: 3000, kid: true }
      ]
    },
    {
      id: "d12", city: "Tokyo — Asakusa / Skytree", hotel: "MIMARU Tokyo Ueno Okachimachi",
      activities: [
        { id: "d12-a1", time: "09:30", category: "culture", title: "Senso-ji Temple & Nakamise Shopping Street", location: "Senso-ji Temple, Asakusa", notes: "Tokyo's oldest temple — arrive early to beat the crowds. Rickshaw rides around Asakusa are a fun splurge with a kid.", cost: 3000, kid: true },
        { id: "d12-a2", time: "12:30", category: "food", title: "Lunch in Asakusa", location: "Asakusa, Tokyo", notes: "", cost: 5000, kid: true },
        { id: "d12-a3", time: "14:00", category: "popculture", title: "Tokyo Skytree + Pokémon Center Skytree Town", location: "Tokyo Skytree, Tokyo", notes: "Pokémon Center Skytree Town is inside the Solamachi mall at the base — easy to combine with the tower visit.", cost: 6500, kid: true },
        { id: "d12-a4", time: "17:00", category: "nature", title: "Sumida River walk", location: "Sumida River, Asakusa", notes: "Boat cruise option back toward Hamarikyu/Odaiba if everyone still has energy.", cost: 0, kid: true }
      ]
    },
    {
      id: "d13", city: "Tokyo — Akihabara / Kanda", hotel: "MIMARU Tokyo Ueno Okachimachi",
      activities: [
        { id: "d13-a1", time: "10:00", category: "golf", title: "Mizuno Tokyo Global Flagship Store", location: "Mizuno Tokyo, 3-1 Kanda Ogawamachi, Chiyoda-ku", notes: "Seven floors including a golf club fitting studio. Open 11:00-20:00 — this slot is early, double check before heading over.", cost: 0, kid: false },
        { id: "d13-a2", time: "12:00", category: "food", title: "Lunch near Ochanomizu/Akihabara", location: "Akihabara, Tokyo", notes: "", cost: 5000, kid: true },
        { id: "d13-a3", time: "13:30", category: "popculture", title: "Akihabara Electric Town", location: "Akihabara, Tokyo", notes: "Anime, games, and arcades — some shops/floors are adult-oriented, so it's worth scouting ahead which buildings are family-friendly.", cost: 5000, kid: true },
        { id: "d13-a4", time: "16:00", category: "popculture", title: "Tokyo Station Character Street + Ramen Street", location: "Tokyo Station, Tokyo", notes: "An underground alley of anime/Pokémon merch shops next to a strip of famous ramen counters — a good last big souvenir run.", cost: 6000, kid: true },
        { id: "d13-a5", time: "19:00", category: "food", title: "Farewell dinner", location: "Tokyo Station area", notes: "", cost: 8000, kid: true }
      ]
    },
    {
      id: "d14", city: "Departure", hotel: "",
      activities: [
        { id: "d14-a1", time: "09:00", category: "shopping", title: "Last-minute souvenirs near Ueno", location: "Ameyoko, Ueno", notes: "", cost: 3000, kid: true },
        { id: "d14-a2", time: "11:00", category: "lodging", title: "Check out: MIMARU Ueno Okachimachi", location: "MIMARU Tokyo Ueno Okachimachi", notes: "", cost: 0, kid: false },
        { id: "d14-a3", time: "12:00", category: "transport", title: "Airport transfer", location: "Ueno Station to airport", notes: "Flying from Narita: the Keisei Skyliner runs direct from Ueno in about 45 minutes — very convenient from this hotel. Flying from Haneda: use the Keisei/Asakusa line through-service or an airport limousine bus.", cost: 2500, kid: true }
      ]
    }
  ],

  packingList: [
    { id: "p1", category: "Documents", item: "Passports (everyone)", packed: false },
    { id: "p2", category: "Documents", item: "Hotel & ticket confirmations (printed + saved offline)", packed: false },
    { id: "p3", category: "Documents", item: "Travel insurance details", packed: false },
    { id: "p4", category: "Documents", item: "Credit cards + some cash (Japan is still cash-heavy outside cities)", packed: false },
    { id: "p5", category: "Tech", item: "Phone chargers + portable battery pack", packed: false },
    { id: "p6", category: "Tech", item: "Japan power adapter (Type A plug, 100V)", packed: false },
    { id: "p7", category: "Tech", item: "Portable wifi / eSIM set up before arrival", packed: false },
    { id: "p8", category: "Tech", item: "Tablet/headphones loaded with shows for train legs", packed: false },
    { id: "p9", category: "Clothing", item: "Layered clothing for mild Oct weather (cool mornings/evenings)", packed: false },
    { id: "p10", category: "Clothing", item: "Comfortable walking shoes (lots of standing/walking)", packed: false },
    { id: "p11", category: "Clothing", item: "Compact umbrella / light rain jacket", packed: false },
    { id: "p12", category: "Clothing", item: "Swimwear (hotel pools / DisneySea splash areas)", packed: false },
    { id: "p13", category: "Kid", item: "Snacks for train rides", packed: false },
    { id: "p14", category: "Kid", item: "Comfort item / small toy", packed: false },
    { id: "p15", category: "Kid", item: "Any medicines + basic first-aid kit", packed: false },
    { id: "p16", category: "Kid", item: "Spare change of clothes", packed: false },
    { id: "p17", category: "Money & Shopping", item: "Suica/PASMO IC cards (or mobile wallet equivalent)", packed: false },
    { id: "p18", category: "Money & Shopping", item: "Foldable tote bag for Pokémon Center / souvenir hauls", packed: false },
    { id: "p19", category: "Money & Shopping", item: "Spare duffel or packable bag for golf gear/extra souvenirs home", packed: false },
    { id: "p20", category: "Misc", item: "Laundry detergent sheets (MIMARU has in-room laundry options)", packed: false },
    { id: "p21", category: "Misc", item: "Hand sanitizer + tissues (handkerchiefs — public restrooms often lack paper towels)", packed: false },
    { id: "p22", category: "Misc", item: "Motion sickness tablets (long train days)", packed: false }
  ],

  budget: [
    { id: "b1", label: "International flights", estimated: 0, actual: 0, notes: "Add your actual fare here." },
    { id: "b2", label: "Tokyo Disneyland 1-day ticket", estimated: 9000, actual: 0, notes: "Dynamic pricing, roughly ¥7,900-10,900/adult — confirm on the official price calendar closer to the date." },
    { id: "b3", label: "Tokyo DisneySea 1-day ticket", estimated: 9000, actual: 0, notes: "Same dynamic pricing range as Disneyland." },
    { id: "b4", label: "Universal Studios Japan 1-day ticket", estimated: 9800, actual: 0, notes: "Starts from ~¥8,900, varies by date/demand." },
    { id: "b5", label: "Shinkansen Tokyo ↔ Osaka (round trip)", estimated: 28000, actual: 0, notes: "Two Nozomi legs, ~¥14,000 each, per person." },
    { id: "b6", label: "Local trains & IC card top-ups", estimated: 8000, actual: 0, notes: "" },
    { id: "b7", label: "Food & dining (14 days)", estimated: 70000, actual: 0, notes: "Rough blended estimate — adjust to your eating style." },
    { id: "b8", label: "Pokémon Center / pop-culture shopping", estimated: 15000, actual: 0, notes: "" },
    { id: "b9", label: "Golf shopping (Mizuno Tokyo)", estimated: 0, actual: 0, notes: "Wildcard — depends what you find." },
    { id: "b10", label: "Souvenirs & misc shopping", estimated: 15000, actual: 0, notes: "" },
    { id: "b11", label: "Travel insurance", estimated: 0, actual: 0, notes: "Add your policy cost." },
    { id: "b12", label: "Portable wifi / eSIM (14 days)", estimated: 6000, actual: 0, notes: "" },
    { id: "b13", label: "Airport transfers (both ends)", estimated: 6000, actual: 0, notes: "" }
  ]
};
