"use client";

import { useState, useCallback, useRef } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User,
  Phone,
  Mail,
  MoreHorizontal,
  Edit,
  Eye,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Star
} from "lucide-react";

interface Booking {
  id: string;
  clientName: string;
  service: string;
  time: string;
  date: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  price: number;
  phone: string;
  email: string;
  duration: number;
  notes?: string;
}

// Get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Get dynamic today and tomorrow strings
const getCurrentTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getCurrentTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getAfterTomorrowString = () => {
  const after = new Date();
  after.setDate(after.getDate() + 2);
  return after.toISOString().split('T')[0];
};

// Get current dates for dummy data
const getCurrentToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getCurrentTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Comprehensive dummy data
const dummyBookings: Booking[] = [
  // Today's bookings
  {
    id: "1",
    clientName: "Sarah Johnson",
    service: "Baby Botox",
    time: "10:00",
    date: getCurrentToday(),
    status: "confirmed",
    price: 199,
    phone: "+44 7700 123456",
    email: "sarah.j@email.com",
    duration: 45
  },
  {
    id: "2",
    clientName: "Emma Williams",
    service: "Lip Enhancement",
    time: "12:30",
    date: getCurrentToday(),
    status: "pending",
    price: 290,
    phone: "+44 7700 234567",
    email: "emma.w@email.com",
    duration: 60
  },
  {
    id: "3",
    clientName: "Lisa Brown",
    service: "Profhilo Treatment",
    time: "14:00",
    date: getCurrentToday(),
    status: "confirmed",
    price: 390,
    phone: "+44 7700 345678",
    email: "lisa.b@email.com",
    duration: 90
  },
  {
    id: "4",
    clientName: "Rachel Green",
    service: "Skin Consultation",
    time: "16:30",
    date: getCurrentToday(),
    status: "confirmed",
    price: 75,
    phone: "+44 7700 456789",
    email: "rachel.g@email.com",
    duration: 30
  },
  {
    id: "5",
    clientName: "Jessica Taylor",
    service: "Anti-wrinkle Treatment",
    time: "18:00",
    date: getCurrentToday(),
    status: "completed",
    price: 220,
    phone: "+44 7700 567890",
    email: "jessica.t@email.com",
    duration: 50
  },
  // Tomorrow's bookings
  {
    id: "6",
    clientName: "Maria Garcia",
    service: "Fat Freezing",
    time: "09:00",
    date: getCurrentTomorrow(),
    status: "confirmed",
    price: 200,
    phone: "+44 7700 678901",
    email: "maria.g@email.com",
    duration: 120
  },
  {
    id: "7",
    clientName: "Jennifer Davis",
    service: "Dermal Fillers",
    time: "11:30",
    date: getCurrentTomorrow(),
    status: "pending",
    price: 320,
    phone: "+44 7700 789012",
    email: "jennifer.d@email.com",
    duration: 75
  },
  {
    id: "8",
    clientName: "Amanda Wilson",
    service: "Botox Treatment",
    time: "14:30",
    date: getCurrentTomorrow(),
    status: "confirmed",
    price: 250,
    phone: "+44 7700 890123",
    email: "amanda.w@email.com",
    duration: 45
  },
  {
    id: "9",
    clientName: "Sophie Anderson",
    service: "Lip Enhancement",
    time: "16:00",
    date: getCurrentTomorrow(),
    status: "confirmed",
    price: 290,
    phone: "+44 7700 901234",
    email: "sophie.a@email.com",
    duration: 60
  },
  // Day after tomorrow's bookings
  {
    id: "10",
    clientName: "Olivia Thompson",
    service: "Profhilo Treatment",
    time: "10:00",
    date: getAfterTomorrowString(),
    status: "pending",
    price: 390,
    phone: "+44 7700 012345",
    email: "olivia.t@email.com",
    duration: 90
  },
  {
    id: "11",
    clientName: "Charlotte White",
    service: "Skin Consultation",
    time: "13:00",
    date: getAfterTomorrowString(),
    status: "confirmed",
    price: 75,
    phone: "+44 7700 123456",
    email: "charlotte.w@email.com",
    duration: 30
  },
  {
    id: "12",
    clientName: "Grace Miller",
    service: "Anti-wrinkle Treatment",
    time: "15:30",
    date: getAfterTomorrowString(),
    status: "confirmed",
    price: 220,
    phone: "+44 7700 234567",
    email: "grace.m@email.com",
    duration: 50
  },
  // 7 bookings for a specific date (2025-01-15)
  {
    id: "13",
    clientName: "Anna Smith",
    service: "Botox Treatment",
    time: "09:00",
    date: "2025-01-15",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 345678",
    email: "anna.s@email.com",
    duration: 45
  },
  {
    id: "14",
    clientName: "Victoria Brown",
    service: "Dermal Fillers",
    time: "10:30",
    date: "2025-01-15",
    status: "pending",
    price: 320,
    phone: "+44 7700 456789",
    email: "victoria.b@email.com",
    duration: 75
  },
  {
    id: "15",
    clientName: "Isabella Davis",
    service: "Lip Enhancement",
    time: "12:00",
    date: "2025-01-15",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 567890",
    email: "isabella.d@email.com",
    duration: 60
  },
  {
    id: "16",
    clientName: "Mia Wilson",
    service: "Profhilo Treatment",
    time: "13:30",
    date: "2025-01-15",
    status: "completed",
    price: 390,
    phone: "+44 7700 678901",
    email: "mia.w@email.com",
    duration: 90
  },
  {
    id: "17",
    clientName: "Chloe Anderson",
    service: "Skin Consultation",
    time: "15:00",
    date: "2025-01-15",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 789012",
    email: "chloe.a@email.com",
    duration: 30
  },
  {
    id: "18",
    clientName: "Lily Thompson",
    service: "Anti-wrinkle Treatment",
    time: "16:30",
    date: "2025-01-15",
    status: "pending",
    price: 220,
    phone: "+44 7700 890123",
    email: "lily.t@email.com",
    duration: 50
  },
  {
    id: "19",
    clientName: "Zoe White",
    service: "Fat Freezing",
    time: "18:00",
    date: "2025-01-15",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 901234",
    email: "zoe.w@email.com",
    duration: 120
  },
  // 10 bookings for another date (2025-01-20)
  {
    id: "20",
    clientName: "Ava Johnson",
    service: "Baby Botox",
    time: "08:00",
    date: "2025-01-20",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 012345",
    email: "ava.j@email.com",
    duration: 45
  },
  {
    id: "21",
    clientName: "Ella Williams",
    service: "Dermal Fillers",
    time: "09:30",
    date: "2025-01-20",
    status: "pending",
    price: 320,
    phone: "+44 7700 123456",
    email: "ella.w@email.com",
    duration: 75
  },
  {
    id: "22",
    clientName: "Harper Brown",
    service: "Lip Enhancement",
    time: "11:00",
    date: "2025-01-20",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 234567",
    email: "harper.b@email.com",
    duration: 60
  },
  {
    id: "23",
    clientName: "Evelyn Davis",
    service: "Botox Treatment",
    time: "12:30",
    date: "2025-01-20",
    status: "completed",
    price: 250,
    phone: "+44 7700 345678",
    email: "evelyn.d@email.com",
    duration: 45
  },
  {
    id: "24",
    clientName: "Abigail Wilson",
    service: "Profhilo Treatment",
    time: "14:00",
    date: "2025-01-20",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 456789",
    email: "abigail.w@email.com",
    duration: 90
  },
  {
    id: "25",
    clientName: "Emily Anderson",
    service: "Skin Consultation",
    time: "15:30",
    date: "2025-01-20",
    status: "pending",
    price: 75,
    phone: "+44 7700 567890",
    email: "emily.a@email.com",
    duration: 30
  },
  {
    id: "26",
    clientName: "Madison Thompson",
    service: "Anti-wrinkle Treatment",
    time: "16:00",
    date: "2025-01-20",
    status: "confirmed",
    price: 220,
    phone: "+44 7700 678901",
    email: "madison.t@email.com",
    duration: 50
  },
  {
    id: "27",
    clientName: "Scarlett White",
    service: "Fat Freezing",
    time: "17:30",
    date: "2025-01-20",
    status: "completed",
    price: 200,
    phone: "+44 7700 789012",
    email: "scarlett.w@email.com",
    duration: 120
  },
  {
    id: "28",
    clientName: "Aria Miller",
    service: "Baby Botox",
    time: "19:00",
    date: "2025-01-20",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 890123",
    email: "aria.m@email.com",
    duration: 45
  },
  {
    id: "29",
    clientName: "Layla Garcia",
    service: "Dermal Fillers",
    time: "20:30",
    date: "2025-01-20",
    status: "pending",
    price: 320,
    phone: "+44 7700 901234",
    email: "layla.g@email.com",
    duration: 75
  },
  // More dummy bookings for various dates
  // 2025-01-16 (3 bookings)
  {
    id: "30",
    clientName: "Nora Johnson",
    service: "Botox Treatment",
    time: "10:00",
    date: "2025-01-16",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 111111",
    email: "nora.j@email.com",
    duration: 45
  },
  {
    id: "31",
    clientName: "Ruby Williams",
    service: "Lip Enhancement",
    time: "14:00",
    date: "2025-01-16",
    status: "pending",
    price: 290,
    phone: "+44 7700 222222",
    email: "ruby.w@email.com",
    duration: 60
  },
  {
    id: "32",
    clientName: "Stella Brown",
    service: "Skin Consultation",
    time: "16:30",
    date: "2025-01-16",
    status: "completed",
    price: 75,
    phone: "+44 7700 333333",
    email: "stella.b@email.com",
    duration: 30
  },
  // 2025-01-17 (5 bookings)
  {
    id: "33",
    clientName: "Hazel Davis",
    service: "Profhilo Treatment",
    time: "09:30",
    date: "2025-01-17",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 444444",
    email: "hazel.d@email.com",
    duration: 90
  },
  {
    id: "34",
    clientName: "Violet Wilson",
    service: "Dermal Fillers",
    time: "11:00",
    date: "2025-01-17",
    status: "pending",
    price: 320,
    phone: "+44 7700 555555",
    email: "violet.w@email.com",
    duration: 75
  },
  {
    id: "35",
    clientName: "Iris Anderson",
    service: "Anti-wrinkle Treatment",
    time: "13:30",
    date: "2025-01-17",
    status: "confirmed",
    price: 220,
    phone: "+44 7700 666666",
    email: "iris.a@email.com",
    duration: 50
  },
  {
    id: "36",
    clientName: "Jasmine Thompson",
    service: "Fat Freezing",
    time: "15:00",
    date: "2025-01-17",
    status: "completed",
    price: 200,
    phone: "+44 7700 777777",
    email: "jasmine.t@email.com",
    duration: 120
  },
  {
    id: "37",
    clientName: "Rose White",
    service: "Baby Botox",
    time: "17:30",
    date: "2025-01-17",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 888888",
    email: "rose.w@email.com",
    duration: 45
  },
  {
    id: "37a",
    clientName: "Luna Black",
    service: "Dermal Fillers",
    time: "19:00",
    date: "2025-01-17",
    status: "pending",
    price: 320,
    phone: "+44 7700 999999",
    email: "luna.b@email.com",
    duration: 75
  },
  {
    id: "37b",
    clientName: "Stella Blue",
    service: "Lip Enhancement",
    time: "20:30",
    date: "2025-01-17",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 000000",
    email: "stella.b@email.com",
    duration: 60
  },
  // 2025-01-18 (4 bookings)
  {
    id: "38",
    clientName: "Daisy Miller",
    service: "Botox Treatment",
    time: "10:30",
    date: "2025-01-18",
    status: "pending",
    price: 250,
    phone: "+44 7700 999999",
    email: "daisy.m@email.com",
    duration: 45
  },
  {
    id: "39",
    clientName: "Lily Garcia",
    service: "Lip Enhancement",
    time: "12:00",
    date: "2025-01-18",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 000000",
    email: "lily.g@email.com",
    duration: 60
  },
  {
    id: "40",
    clientName: "Poppy Smith",
    service: "Dermal Fillers",
    time: "14:30",
    date: "2025-01-18",
    status: "completed",
    price: 320,
    phone: "+44 7700 111110",
    email: "poppy.s@email.com",
    duration: 75
  },
  {
    id: "41",
    clientName: "Sunflower Brown",
    service: "Skin Consultation",
    time: "16:00",
    date: "2025-01-18",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 222221",
    email: "sunflower.b@email.com",
    duration: 30
  },
  {
    id: "41a",
    clientName: "Marigold Green",
    service: "Anti-wrinkle Treatment",
    time: "17:30",
    date: "2025-01-18",
    status: "pending",
    price: 220,
    phone: "+44 7700 333332",
    email: "marigold.g@email.com",
    duration: 50
  },
  {
    id: "41b",
    clientName: "Petunia Purple",
    service: "Fat Freezing",
    time: "19:00",
    date: "2025-01-18",
    status: "completed",
    price: 200,
    phone: "+44 7700 444443",
    email: "petunia.p@email.com",
    duration: 120
  },
  {
    id: "41c",
    clientName: "Zinnia Orange",
    service: "Baby Botox",
    time: "20:30",
    date: "2025-01-18",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 555554",
    email: "zinnia.o@email.com",
    duration: 45
  },
  // 2025-01-19 (6 bookings)
  {
    id: "42",
    clientName: "Tulip Davis",
    service: "Profhilo Treatment",
    time: "09:00",
    date: "2025-01-19",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 333332",
    email: "tulip.d@email.com",
    duration: 90
  },
  {
    id: "43",
    clientName: "Orchid Wilson",
    service: "Anti-wrinkle Treatment",
    time: "11:30",
    date: "2025-01-19",
    status: "pending",
    price: 220,
    phone: "+44 7700 444443",
    email: "orchid.w@email.com",
    duration: 50
  },
  {
    id: "44",
    clientName: "Lavender Anderson",
    service: "Fat Freezing",
    time: "13:00",
    date: "2025-01-19",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 555554",
    email: "lavender.a@email.com",
    duration: 120
  },
  {
    id: "45",
    clientName: "Sage Thompson",
    service: "Baby Botox",
    time: "15:30",
    date: "2025-01-19",
    status: "completed",
    price: 199,
    phone: "+44 7700 666665",
    email: "sage.t@email.com",
    duration: 45
  },
  {
    id: "46",
    clientName: "Mint White",
    service: "Botox Treatment",
    time: "17:00",
    date: "2025-01-19",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 777776",
    email: "mint.w@email.com",
    duration: 45
  },
  {
    id: "47",
    clientName: "Basil Miller",
    service: "Lip Enhancement",
    time: "18:30",
    date: "2025-01-19",
    status: "pending",
    price: 290,
    phone: "+44 7700 888887",
    email: "basil.m@email.com",
    duration: 60
  },
  {
    id: "47a",
    clientName: "Coriander Green",
    service: "Dermal Fillers",
    time: "20:00",
    date: "2025-01-19",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 999998",
    email: "coriander.g@email.com",
    duration: 75
  },
  {
    id: "47b",
    clientName: "Fennel Yellow",
    service: "Profhilo Treatment",
    time: "21:30",
    date: "2025-01-19",
    status: "completed",
    price: 390,
    phone: "+44 7700 000009",
    email: "fennel.y@email.com",
    duration: 90
  },
  // 2025-01-21 (8 bookings)
  {
    id: "48",
    clientName: "Thyme Garcia",
    service: "Dermal Fillers",
    time: "08:30",
    date: "2025-01-21",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 999998",
    email: "thyme.g@email.com",
    duration: 75
  },
  {
    id: "49",
    clientName: "Rosemary Smith",
    service: "Profhilo Treatment",
    time: "10:00",
    date: "2025-01-21",
    status: "pending",
    price: 390,
    phone: "+44 7700 000009",
    email: "rosemary.s@email.com",
    duration: 90
  },
  {
    id: "50",
    clientName: "Oregano Brown",
    service: "Skin Consultation",
    time: "11:30",
    date: "2025-01-21",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 111118",
    email: "oregano.b@email.com",
    duration: 30
  },
  {
    id: "51",
    clientName: "Parsley Davis",
    service: "Anti-wrinkle Treatment",
    time: "13:00",
    date: "2025-01-21",
    status: "completed",
    price: 220,
    phone: "+44 7700 222227",
    email: "parsley.d@email.com",
    duration: 50
  },
  {
    id: "52",
    clientName: "Cilantro Wilson",
    service: "Fat Freezing",
    time: "14:30",
    date: "2025-01-21",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 333336",
    email: "cilantro.w@email.com",
    duration: 120
  },
  {
    id: "53",
    clientName: "Dill Anderson",
    service: "Baby Botox",
    time: "16:00",
    date: "2025-01-21",
    status: "pending",
    price: 199,
    phone: "+44 7700 444445",
    email: "dill.a@email.com",
    duration: 45
  },
  {
    id: "54",
    clientName: "Chive Thompson",
    service: "Botox Treatment",
    time: "17:30",
    date: "2025-01-21",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 555554",
    email: "chive.t@email.com",
    duration: 45
  },
  {
    id: "55",
    clientName: "Tarragon White",
    service: "Lip Enhancement",
    time: "19:00",
    date: "2025-01-21",
    status: "completed",
    price: 290,
    phone: "+44 7700 666663",
    email: "tarragon.w@email.com",
    duration: 60
  },
  // 2025-01-22 (2 bookings)
  {
    id: "56",
    clientName: "Marjoram Miller",
    service: "Dermal Fillers",
    time: "10:00",
    date: "2025-01-22",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 777772",
    email: "marjoram.m@email.com",
    duration: 75
  },
  {
    id: "57",
    clientName: "Bay Garcia",
    service: "Profhilo Treatment",
    time: "15:00",
    date: "2025-01-22",
    status: "pending",
    price: 390,
    phone: "+44 7700 888881",
    email: "bay.g@email.com",
    duration: 90
  },
  // 2025-01-23 (9 bookings)
  {
    id: "58",
    clientName: "Sage Smith",
    service: "Skin Consultation",
    time: "08:00",
    date: "2025-01-23",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 999990",
    email: "sage.s@email.com",
    duration: 30
  },
  {
    id: "59",
    clientName: "Mint Brown",
    service: "Anti-wrinkle Treatment",
    time: "09:30",
    date: "2025-01-23",
    status: "pending",
    price: 220,
    phone: "+44 7700 000001",
    email: "mint.b@email.com",
    duration: 50
  },
  {
    id: "60",
    clientName: "Basil Davis",
    service: "Fat Freezing",
    time: "11:00",
    date: "2025-01-23",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 111112",
    email: "basil.d@email.com",
    duration: 120
  },
  {
    id: "61",
    clientName: "Thyme Wilson",
    service: "Baby Botox",
    time: "12:30",
    date: "2025-01-23",
    status: "completed",
    price: 199,
    phone: "+44 7700 222223",
    email: "thyme.w@email.com",
    duration: 45
  },
  {
    id: "62",
    clientName: "Rosemary Anderson",
    service: "Botox Treatment",
    time: "14:00",
    date: "2025-01-23",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 333334",
    email: "rosemary.a@email.com",
    duration: 45
  },
  {
    id: "63",
    clientName: "Oregano Thompson",
    service: "Lip Enhancement",
    time: "15:30",
    date: "2025-01-23",
    status: "pending",
    price: 290,
    phone: "+44 7700 444445",
    email: "oregano.t@email.com",
    duration: 60
  },
  {
    id: "64",
    clientName: "Parsley White",
    service: "Dermal Fillers",
    time: "17:00",
    date: "2025-01-23",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 555556",
    email: "parsley.w@email.com",
    duration: 75
  },
  {
    id: "65",
    clientName: "Cilantro Miller",
    service: "Profhilo Treatment",
    time: "18:30",
    date: "2025-01-23",
    status: "completed",
    price: 390,
    phone: "+44 7700 666667",
    email: "cilantro.m@email.com",
    duration: 90
  },
  {
    id: "66",
    clientName: "Dill Garcia",
    service: "Skin Consultation",
    time: "20:00",
    date: "2025-01-23",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 777778",
    email: "dill.g@email.com",
    duration: 30
  },
  // October 2025 bookings (current month) - progressive bookings
  // 2025-10-14 (1 booking)
  {
    id: "67",
    clientName: "Alex Johnson",
    service: "Botox Treatment",
    time: "10:00",
    date: "2025-10-14",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 111111",
    email: "alex.j@email.com",
    duration: 45
  },
  // 2025-10-15 (2 bookings)
  {
    id: "68",
    clientName: "Sam Wilson",
    service: "Dermal Fillers",
    time: "09:00",
    date: "2025-10-15",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 222222",
    email: "sam.w@email.com",
    duration: 75
  },
  {
    id: "69",
    clientName: "Jordan Brown",
    service: "Lip Enhancement",
    time: "14:00",
    date: "2025-10-15",
    status: "pending",
    price: 290,
    phone: "+44 7700 333333",
    email: "jordan.b@email.com",
    duration: 60
  },
  // 2025-10-16 (3 bookings)
  {
    id: "70",
    clientName: "Casey Davis",
    service: "Profhilo Treatment",
    time: "09:30",
    date: "2025-10-16",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 444444",
    email: "casey.d@email.com",
    duration: 90
  },
  {
    id: "71",
    clientName: "Riley Miller",
    service: "Skin Consultation",
    time: "12:00",
    date: "2025-10-16",
    status: "pending",
    price: 75,
    phone: "+44 7700 555555",
    email: "riley.m@email.com",
    duration: 30
  },
  {
    id: "72",
    clientName: "Avery Garcia",
    service: "Anti-wrinkle Treatment",
    time: "16:30",
    date: "2025-10-16",
    status: "completed",
    price: 220,
    phone: "+44 7700 666666",
    email: "avery.g@email.com",
    duration: 50
  },
  // 2025-10-17 (4 bookings)
  {
    id: "73",
    clientName: "Quinn Smith",
    service: "Fat Freezing",
    time: "08:00",
    date: "2025-10-17",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 777777",
    email: "quinn.s@email.com",
    duration: 120
  },
  {
    id: "74",
    clientName: "Sage White",
    service: "Baby Botox",
    time: "11:30",
    date: "2025-10-17",
    status: "pending",
    price: 199,
    phone: "+44 7700 888888",
    email: "sage.w@email.com",
    duration: 45
  },
  {
    id: "75",
    clientName: "River Black",
    service: "Botox Treatment",
    time: "14:00",
    date: "2025-10-17",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 999999",
    email: "river.b@email.com",
    duration: 45
  },
  {
    id: "76",
    clientName: "Phoenix Green",
    service: "Dermal Fillers",
    time: "17:30",
    date: "2025-10-17",
    status: "completed",
    price: 320,
    phone: "+44 7700 000000",
    email: "phoenix.g@email.com",
    duration: 75
  },
  // 2025-10-18 (5 bookings)
  {
    id: "77",
    clientName: "Skylar Blue",
    service: "Lip Enhancement",
    time: "09:00",
    date: "2025-10-18",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 111110",
    email: "skylar.b@email.com",
    duration: 60
  },
  {
    id: "78",
    clientName: "Rowan Purple",
    service: "Profhilo Treatment",
    time: "11:00",
    date: "2025-10-18",
    status: "pending",
    price: 390,
    phone: "+44 7700 222221",
    email: "rowan.p@email.com",
    duration: 90
  },
  {
    id: "79",
    clientName: "Emery Orange",
    service: "Skin Consultation",
    time: "13:30",
    date: "2025-10-18",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 333332",
    email: "emery.o@email.com",
    duration: 30
  },
  {
    id: "80",
    clientName: "Finley Red",
    service: "Anti-wrinkle Treatment",
    time: "15:00",
    date: "2025-10-18",
    status: "completed",
    price: 220,
    phone: "+44 7700 444443",
    email: "finley.r@email.com",
    duration: 50
  },
  {
    id: "81",
    clientName: "Hayden Yellow",
    service: "Fat Freezing",
    time: "18:00",
    date: "2025-10-18",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 555554",
    email: "hayden.y@email.com",
    duration: 120
  },
  // 2025-10-19 (6 bookings)
  {
    id: "82",
    clientName: "Morgan Pink",
    service: "Baby Botox",
    time: "08:30",
    date: "2025-10-19",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 666665",
    email: "morgan.p@email.com",
    duration: 45
  },
  {
    id: "83",
    clientName: "Cameron Teal",
    service: "Botox Treatment",
    time: "10:30",
    date: "2025-10-19",
    status: "pending",
    price: 250,
    phone: "+44 7700 777776",
    email: "cameron.t@email.com",
    duration: 45
  },
  {
    id: "84",
    clientName: "Drew Indigo",
    service: "Dermal Fillers",
    time: "12:30",
    date: "2025-10-19",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 888887",
    email: "drew.i@email.com",
    duration: 75
  },
  {
    id: "85",
    clientName: "Blake Violet",
    service: "Lip Enhancement",
    time: "14:30",
    date: "2025-10-19",
    status: "completed",
    price: 290,
    phone: "+44 7700 999998",
    email: "blake.v@email.com",
    duration: 60
  },
  {
    id: "86",
    clientName: "Taylor Cyan",
    service: "Profhilo Treatment",
    time: "16:30",
    date: "2025-10-19",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 000009",
    email: "taylor.c@email.com",
    duration: 90
  },
  {
    id: "87",
    clientName: "Jamie Magenta",
    service: "Skin Consultation",
    time: "19:00",
    date: "2025-10-19",
    status: "pending",
    price: 75,
    phone: "+44 7700 111118",
    email: "jamie.m@email.com",
    duration: 30
  },
  // 2025-10-20 (7 bookings)
  {
    id: "88",
    clientName: "Alexis Lime",
    service: "Anti-wrinkle Treatment",
    time: "09:00",
    date: "2025-10-20",
    status: "confirmed",
    price: 220,
    phone: "+44 7700 222227",
    email: "alexis.l@email.com",
    duration: 50
  },
  {
    id: "89",
    clientName: "Jordan Amber",
    service: "Fat Freezing",
    time: "10:30",
    date: "2025-10-20",
    status: "pending",
    price: 200,
    phone: "+44 7700 333336",
    email: "jordan.a@email.com",
    duration: 120
  },
  {
    id: "90",
    clientName: "Casey Coral",
    service: "Baby Botox",
    time: "12:00",
    date: "2025-10-20",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 444445",
    email: "casey.c@email.com",
    duration: 45
  },
  {
    id: "91",
    clientName: "Riley Mint",
    service: "Botox Treatment",
    time: "13:30",
    date: "2025-10-20",
    status: "completed",
    price: 250,
    phone: "+44 7700 555554",
    email: "riley.m@email.com",
    duration: 45
  },
  {
    id: "92",
    clientName: "Avery Peach",
    service: "Dermal Fillers",
    time: "15:00",
    date: "2025-10-20",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 666663",
    email: "avery.p@email.com",
    duration: 75
  },
  {
    id: "93",
    clientName: "Quinn Rose",
    service: "Lip Enhancement",
    time: "16:30",
    date: "2025-10-20",
    status: "pending",
    price: 290,
    phone: "+44 7700 777772",
    email: "quinn.r@email.com",
    duration: 60
  },
  {
    id: "94",
    clientName: "Sage Lavender",
    service: "Profhilo Treatment",
    time: "18:00",
    date: "2025-10-20",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 888881",
    email: "sage.l@email.com",
    duration: 90
  },
  // 2025-10-21 (8 bookings)
  {
    id: "95",
    clientName: "River Sage",
    service: "Skin Consultation",
    time: "08:00",
    date: "2025-10-21",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 999990",
    email: "river.s@email.com",
    duration: 30
  },
  {
    id: "96",
    clientName: "Phoenix Mint",
    service: "Anti-wrinkle Treatment",
    time: "09:30",
    date: "2025-10-21",
    status: "pending",
    price: 220,
    phone: "+44 7700 000001",
    email: "phoenix.m@email.com",
    duration: 50
  },
  {
    id: "97",
    clientName: "Skylar Basil",
    service: "Fat Freezing",
    time: "11:00",
    date: "2025-10-21",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 111112",
    email: "skylar.b@email.com",
    duration: 120
  },
  {
    id: "98",
    clientName: "Rowan Thyme",
    service: "Baby Botox",
    time: "12:30",
    date: "2025-10-21",
    status: "completed",
    price: 199,
    phone: "+44 7700 222223",
    email: "rowan.t@email.com",
    duration: 45
  },
  {
    id: "99",
    clientName: "Emery Rosemary",
    service: "Botox Treatment",
    time: "14:00",
    date: "2025-10-21",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 333334",
    email: "emery.r@email.com",
    duration: 45
  },
  {
    id: "100",
    clientName: "Finley Oregano",
    service: "Dermal Fillers",
    time: "15:30",
    date: "2025-10-21",
    status: "pending",
    price: 320,
    phone: "+44 7700 444445",
    email: "finley.o@email.com",
    duration: 75
  },
  {
    id: "101",
    clientName: "Hayden Parsley",
    service: "Lip Enhancement",
    time: "17:00",
    date: "2025-10-21",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 555556",
    email: "hayden.p@email.com",
    duration: 60
  },
  {
    id: "102",
    clientName: "Morgan Cilantro",
    service: "Profhilo Treatment",
    time: "18:30",
    date: "2025-10-21",
    status: "completed",
    price: 390,
    phone: "+44 7700 666667",
    email: "morgan.c@email.com",
    duration: 90
  },
  // 2025-10-22 (9 bookings)
  {
    id: "103",
    clientName: "Cameron Dill",
    service: "Skin Consultation",
    time: "08:30",
    date: "2025-10-22",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 777778",
    email: "cameron.d@email.com",
    duration: 30
  },
  {
    id: "104",
    clientName: "Drew Chive",
    service: "Anti-wrinkle Treatment",
    time: "10:00",
    date: "2025-10-22",
    status: "pending",
    price: 220,
    phone: "+44 7700 888889",
    email: "drew.c@email.com",
    duration: 50
  },
  {
    id: "105",
    clientName: "Blake Tarragon",
    service: "Fat Freezing",
    time: "11:30",
    date: "2025-10-22",
    status: "confirmed",
    price: 200,
    phone: "+44 7700 999990",
    email: "blake.t@email.com",
    duration: 120
  },
  {
    id: "106",
    clientName: "Taylor Marjoram",
    service: "Baby Botox",
    time: "13:00",
    date: "2025-10-22",
    status: "completed",
    price: 199,
    phone: "+44 7700 000001",
    email: "taylor.m@email.com",
    duration: 45
  },
  {
    id: "107",
    clientName: "Jamie Bay",
    service: "Botox Treatment",
    time: "14:30",
    date: "2025-10-22",
    status: "confirmed",
    price: 250,
    phone: "+44 7700 111112",
    email: "jamie.b@email.com",
    duration: 45
  },
  {
    id: "108",
    clientName: "Alexis Sage",
    service: "Dermal Fillers",
    time: "16:00",
    date: "2025-10-22",
    status: "pending",
    price: 320,
    phone: "+44 7700 222223",
    email: "alexis.s@email.com",
    duration: 75
  },
  {
    id: "109",
    clientName: "Jordan Mint",
    service: "Lip Enhancement",
    time: "17:30",
    date: "2025-10-22",
    status: "confirmed",
    price: 290,
    phone: "+44 7700 333334",
    email: "jordan.m@email.com",
    duration: 60
  },
  {
    id: "110",
    clientName: "Casey Basil",
    service: "Profhilo Treatment",
    time: "19:00",
    date: "2025-10-22",
    status: "completed",
    price: 390,
    phone: "+44 7700 444445",
    email: "casey.b@email.com",
    duration: 90
  },
  {
    id: "111",
    clientName: "Riley Thyme",
    service: "Skin Consultation",
    time: "20:30",
    date: "2025-10-22",
    status: "confirmed",
    price: 75,
    phone: "+44 7700 555556",
    email: "riley.t@email.com",
    duration: 30
  },
  // 2025-10-23 (10 bookings)
  {
    id: "112",
    clientName: "Avery Rosemary",
    service: "Anti-wrinkle Treatment",
    time: "08:00",
    date: "2025-10-23",
    status: "confirmed",
    price: 220,
    phone: "+44 7700 666667",
    email: "avery.r@email.com",
    duration: 50
  },
  {
    id: "113",
    clientName: "Quinn Oregano",
    service: "Fat Freezing",
    time: "09:30",
    date: "2025-10-23",
    status: "pending",
    price: 200,
    phone: "+44 7700 777778",
    email: "quinn.o@email.com",
    duration: 120
  },
  {
    id: "114",
    clientName: "Sage Parsley",
    service: "Baby Botox",
    time: "11:00",
    date: "2025-10-23",
    status: "confirmed",
    price: 199,
    phone: "+44 7700 888889",
    email: "sage.p@email.com",
    duration: 45
  },
  {
    id: "115",
    clientName: "River Cilantro",
    service: "Botox Treatment",
    time: "12:30",
    date: "2025-10-23",
    status: "completed",
    price: 250,
    phone: "+44 7700 999990",
    email: "river.c@email.com",
    duration: 45
  },
  {
    id: "116",
    clientName: "Phoenix Dill",
    service: "Dermal Fillers",
    time: "14:00",
    date: "2025-10-23",
    status: "confirmed",
    price: 320,
    phone: "+44 7700 000001",
    email: "phoenix.d@email.com",
    duration: 75
  },
  {
    id: "117",
    clientName: "Skylar Chive",
    service: "Lip Enhancement",
    time: "15:30",
    date: "2025-10-23",
    status: "pending",
    price: 290,
    phone: "+44 7700 111112",
    email: "skylar.c@email.com",
    duration: 60
  },
  {
    id: "118",
    clientName: "Rowan Tarragon",
    service: "Profhilo Treatment",
    time: "17:00",
    date: "2025-10-23",
    status: "confirmed",
    price: 390,
    phone: "+44 7700 222223",
    email: "rowan.t@email.com",
    duration: 90
  },
  {
    id: "119",
    clientName: "Emery Marjoram",
    service: "Skin Consultation",
    time: "18:30",
    date: "2025-10-23",
    status: "completed",
    price: 75,
    phone: "+44 7700 333334",
    email: "emery.m@email.com",
    duration: 30
  },
  {
    id: "120",
    clientName: "Finley Bay",
    service: "Anti-wrinkle Treatment",
    time: "20:00",
    date: "2025-10-23",
    status: "confirmed",
    price: 220,
    phone: "+44 7700 444445",
    email: "finley.b@email.com",
    duration: 50
  },
  {
    id: "121",
    clientName: "Hayden Sage",
    service: "Fat Freezing",
    time: "21:30",
    date: "2025-10-23",
    status: "pending",
    price: 200,
    phone: "+44 7700 555556",
    email: "hayden.s@email.com",
    duration: 120
  }
];

// Dummy customers data
const dummyCustomers = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+44 7700 123456", totalBookings: 12, lastVisit: "2025-01-08" },
  { id: "2", name: "Emma Williams", email: "emma.w@email.com", phone: "+44 7700 234567", totalBookings: 8, lastVisit: "2025-01-08" },
  { id: "3", name: "Lisa Brown", email: "lisa.b@email.com", phone: "+44 7700 345678", totalBookings: 15, lastVisit: "2025-01-08" },
  { id: "4", name: "Rachel Green", email: "rachel.g@email.com", phone: "+44 7700 456789", totalBookings: 6, lastVisit: "2025-01-08" },
  { id: "5", name: "Jessica Taylor", email: "jessica.t@email.com", phone: "+44 7700 567890", totalBookings: 10, lastVisit: "2025-01-08" },
  { id: "6", name: "Maria Garcia", email: "maria.g@email.com", phone: "+44 7700 678901", totalBookings: 4, lastVisit: "2025-01-09" },
  { id: "7", name: "Jennifer Davis", email: "jennifer.d@email.com", phone: "+44 7700 789012", totalBookings: 7, lastVisit: "2025-01-09" },
  { id: "8", name: "Amanda Wilson", email: "amanda.w@email.com", phone: "+44 7700 890123", totalBookings: 11, lastVisit: "2025-01-09" },
  { id: "9", name: "Sophie Anderson", email: "sophie.a@email.com", phone: "+44 7700 901234", totalBookings: 9, lastVisit: "2025-01-09" },
  { id: "10", name: "Olivia Thompson", email: "olivia.t@email.com", phone: "+44 7700 012345", totalBookings: 5, lastVisit: "2025-01-10" }
];

// Dummy reviews data
const dummyReviews = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    rating: 5,
    comment: "Absolutely fantastic experience! The staff was professional and the results exceeded my expectations. Highly recommend!",
    service: "Baby Botox",
    date: "2025-01-05"
  },
  {
    id: "2",
    customerName: "Emma Williams",
    rating: 5,
    comment: "The lip enhancement treatment was perfect. Natural-looking results and excellent aftercare. Will definitely be back!",
    service: "Lip Enhancement",
    date: "2025-01-03"
  },
  {
    id: "3",
    customerName: "Lisa Brown",
    rating: 5,
    comment: "Profhilo treatment was amazing! My skin looks so much better. The practitioner was knowledgeable and made me feel comfortable throughout.",
    service: "Profhilo Treatment",
    date: "2025-01-02"
  },
  {
    id: "4",
    customerName: "Rachel Green",
    rating: 5,
    comment: "Great consultation service. They took time to understand my needs and provided excellent advice. Very professional clinic.",
    service: "Skin Consultation",
    date: "2025-01-01"
  },
  {
    id: "5",
    customerName: "Jessica Taylor",
    rating: 4,
    comment: "Good anti-wrinkle treatment. Results were visible and natural. The clinic has a lovely atmosphere and friendly staff.",
    service: "Anti-wrinkle Treatment",
    date: "2024-12-30"
  },
  {
    id: "6",
    customerName: "Maria Garcia",
    rating: 5,
    comment: "Fat freezing treatment worked better than expected! Professional service and great results. Highly recommend this clinic.",
    service: "Fat Freezing",
    date: "2024-12-28"
  },
  {
    id: "7",
    customerName: "Jennifer Davis",
    rating: 5,
    comment: "Excellent dermal filler treatment. The practitioner was skilled and the results look very natural. Very happy with the service!",
    service: "Dermal Fillers",
    date: "2024-12-25"
  },
  {
    id: "8",
    customerName: "Amanda Wilson",
    rating: 5,
    comment: "Outstanding Botox treatment! Quick, painless, and effective. The clinic is clean and modern with professional staff.",
    service: "Botox Treatment",
    date: "2024-12-22"
  }
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(dummyBookings);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "uncompleted">("all");
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ day: any, bookings: any[] } | null>(null);

  // Memoized filter handlers to prevent unnecessary re-renders
  const handleFilterChange = useCallback((filter: "all" | "completed" | "uncompleted") => {
    setStatusFilter(filter);
  }, []);

  const handleDateHover = (e: React.MouseEvent, day: any) => {
    const bookingsForDay = getBookingsForDate(day.dateString);
    if (bookingsForDay.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = Math.min(400, 200 + (bookingsForDay.length * 60)); // Dynamic height based on bookings
      
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      let top = rect.bottom + 10;
      
      // Adjust if tooltip would go off screen horizontally
      if (left < 10) left = 10;
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      
      // Adjust if tooltip would go off screen vertically
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = rect.top - tooltipHeight - 10;
        // If still doesn't fit, position it at the top of the screen
        if (top < 10) {
          top = 10;
        }
      }
      
      setTooltipPosition({ top, left });
      setTooltipData({ day, bookings: bookingsForDay });
      setShowTooltip(true);
    }
  };

  const handleDateLeave = () => {
    setShowTooltip(false);
    setTooltipData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md";
      case "completed":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md";
    }
  };

  const getBookingsForDate = (date: string) => {
    let filteredBookings = bookings.filter(booking => booking.date === date);
    
    // Apply status filter
    if (statusFilter === "completed") {
      filteredBookings = filteredBookings.filter(booking => booking.status === "completed");
    } else if (statusFilter === "uncompleted") {
      filteredBookings = filteredBookings.filter(booking => booking.status !== "completed");
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredBookings;
  };

  // Get today's bookings with search filter
  const getTodaysBookings = () => {
    return getBookingsForDate(getCurrentTodayString());
  };

  // Get tomorrow's bookings with search filter
  const getTomorrowsBookings = () => {
    return getBookingsForDate(getCurrentTomorrowString());
  };

  const markBookingAsCompleted = (bookingId: string) => {
    // For now, this is manual - in real app would update database
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId && booking.status !== 'completed'
          ? { ...booking, status: 'completed' as const }
          : booking
      )
    );
  };

  const markBookingAsUncomplete = (bookingId: string) => {
    // For now, this is manual - in real app would update database
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId && booking.status === 'completed'
          ? { ...booking, status: 'confirmed' as const }
          : booking
      )
    );
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    
    // Adjust to start from Monday (0 = Sunday, 1 = Monday)
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), subtract 6; otherwise subtract dayOfWeek - 1
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - daysToSubtract);
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDayOfCalendar);
      date.setDate(firstDayOfCalendar.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      
      days.push({
        date: date.getDate(),
        isCurrentMonth,
        isToday,
        dateString,
        bookings: getBookingsForDate(dateString)
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };


  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-playfair mb-2">
                Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your appointments and bookings
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 lg:w-auto w-full">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">This Week</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">£4.8k</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's and Tomorrow's Bookings - Top Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Bookings */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Clock className="w-5 h-5 text-green-500 mr-2" />
                  Today's Bookings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {getTodaysBookings().slice(0, 5).map((booking) => (
                    <div key={booking.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {booking.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {booking.clientName}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {booking.service}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>£{booking.price}</span>
                        <span>{booking.duration}min</span>
                      </div>
                    </div>
                  ))}
                  {getTodaysBookings().length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No bookings for today
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tomorrow's Bookings */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 text-purple-500 mr-2" />
                  Tomorrow's Bookings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {getTomorrowsBookings().slice(0, 4).map((booking) => (
                    <div key={booking.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {booking.time}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {booking.clientName}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {booking.service}
                      </p>
                    </div>
                  ))}
                  {getTomorrowsBookings().length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No bookings for tomorrow
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Calendar */}
        <div className="w-full">
          
          {/* Main Calendar */}
          <div className="w-full">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
              
              {/* Calendar Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDate(currentDate)}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    
                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFilterChange("all");
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === "all"
                            ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFilterChange("completed");
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === "completed"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        Completed
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFilterChange("uncompleted");
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === "uncompleted"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        Uncompleted
                    </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (day.isCurrentMonth && day.bookings.length > 0) {
                          setSelectedDate(day.dateString);
                          setShowBookingsModal(true);
                        }
                      }}
                      className={`relative p-2 h-32 text-left rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        day.isCurrentMonth
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      } ${
                        day.isToday
                          ? "border-2 border-rose-500 shadow-lg"
                          : ""
                      }`}
                    >
                      {/* Date number - at top with hover tooltip */}
                      <div 
                        className={`text-sm font-bold mb-1 cursor-pointer px-1 pt-0.5 ${
                          day.isCurrentMonth 
                            ? "text-gray-900 dark:text-white" 
                            : "text-gray-400 dark:text-gray-600"
                        }`}
                        onMouseEnter={(e) => handleDateHover(e, day)}
                        onMouseLeave={handleDateLeave}
                      >
                        {day.date}
                      </div>
                      
                      {/* Bookings - Hour boxes with borders in columns */}
                      <div className="grid grid-cols-2 gap-0.5 px-0.5">
                        {day.bookings.slice(0, 6).map((booking, bookingIndex) => (
                          <div
                            key={bookingIndex}
                            className={`w-full h-6 text-xs rounded border-2 text-center flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative group px-0.5 py-0 ${
                              booking.status === 'confirmed' 
                                ? 'border-green-500 text-green-700 dark:text-green-400' 
                                : booking.status === 'pending'
                                ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
                                : booking.status === 'completed'
                                ? 'border-blue-500 text-blue-700 dark:text-blue-400'
                                : 'border-red-500 text-red-700 dark:text-red-400'
                            }`}
                            title={`${booking.clientName} - ${booking.service} at ${booking.time}`}
                          >
                            <span className="text-xs font-medium">{booking.time}</span>
                            
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                              <div className="font-semibold">{booking.clientName}</div>
                              <div className="text-gray-300">{booking.service}</div>
                              <div className="text-gray-400">£{booking.price} • {booking.duration}min</div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                            </div>
                          </div>
                        ))}
                        {day.bookings.length > 6 && (
                          <div className={`w-full h-7 text-xs text-center flex items-center justify-center font-medium rounded border-2 px-1 py-1 ${
                            day.isToday 
                              ? "text-white/90 border-white/30" 
                              : "text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                          }`}>
                            +{day.bookings.length - 6}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>

      {/* Hover Tooltip */}
      {showTooltip && tooltipData && (
        <div 
          className="fixed p-3 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[99999] overflow-y-auto scrollbar-thin scrollbar-thumb-rose-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-700"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: '320px', // Fixed width for consistency
            maxHeight: '400px', // Max height with scroll
            maxWidth: 'calc(100vw - 2rem)' // Ensure it fits in viewport
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2 sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-600">
            {tooltipData.bookings.length} Booking{tooltipData.bookings.length !== 1 ? 's' : ''} on {tooltipData.day.dateString}
          </div>
          <div className="space-y-1.5">
            {tooltipData.bookings.map((booking, idx) => (
              <div key={idx} className="p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded border-l-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" style={{
                borderLeftColor: booking.status === 'confirmed' 
                  ? '#10b981' 
                  : booking.status === 'pending'
                  ? '#f59e0b'
                  : booking.status === 'completed'
                  ? '#3b82f6'
                  : '#ef4444'
              }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-gray-900 dark:text-white text-xs truncate pr-2">
                    {booking.clientName}
                  </div>
                  <div className="text-xs font-medium px-1 py-0.5 rounded flex-shrink-0" style={{
                    backgroundColor: booking.status === 'confirmed' 
                      ? '#d1fae5' 
                      : booking.status === 'pending'
                      ? '#fef3c7'
                      : booking.status === 'completed'
                      ? '#dbeafe'
                      : '#fee2e2',
                    color: booking.status === 'confirmed' 
                      ? '#065f46' 
                      : booking.status === 'pending'
                      ? '#92400e'
                      : booking.status === 'completed'
                      ? '#1e40af'
                      : '#991b1b'
                  }}>
                    {booking.status}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-medium">{booking.time}</span> • <span className="truncate">{booking.service}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-500">{booking.duration} min</span>
                  <span className="font-bold text-gray-900 dark:text-white">£{booking.price}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Total for the day */}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 sticky bottom-0 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-700 dark:text-gray-300">Total Revenue:</span>
              <span className="text-rose-600 dark:text-rose-400">
                £{tooltipData.bookings.reduce((sum, b) => sum + b.price, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {showBookingsModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bookings for {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                    })}
                  </h3>
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedDate(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                </div>
                    </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                {getBookingsForDate(selectedDate).map((booking) => (
                        <div key={booking.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                          {booking.status === "confirmed" && <CheckCircle className="w-4 h-4" />}
                          {booking.status === "pending" && <Clock className="w-4 h-4" />}
                          {booking.status === "completed" && <CheckCircle className="w-4 h-4" />}
                          {booking.status === "cancelled" && <XCircle className="w-4 h-4" />}
                              </div>
                        <div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {booking.time}
                              </span>
                            </div>
                      </div>
                          </div>

                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {booking.clientName}
                          </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {booking.service}
                          </p>

                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span>£{booking.price}</span>
                      <span>{booking.duration} minutes</span>
                          </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Phone className="w-3 h-3" />
                      <span>{booking.phone}</span>
                      <Mail className="w-3 h-3 ml-2" />
                      <span>{booking.email}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2">
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => markBookingAsCompleted(booking.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark Complete
                            </button>
                      )}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => markBookingAsUncomplete(booking.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-medium rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-sm hover:shadow-md"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Mark Uncomplete
                            </button>
                  )}
                      {booking.status === 'cancelled' && (
                        <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-lg">
                          <XCircle className="w-3 h-3 mr-1" />
                          Cancelled
              </div>
            )}
              </div>
                    </div>
                  ))}
                
                {getBookingsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No bookings for this date
                          </p>
                        </div>
                )}
                      </div>
                      </div>
                    </div>
                </div>
      )}
    </div>
  );
}