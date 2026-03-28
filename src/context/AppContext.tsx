import { AppState } from "react-native";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { calculateSuggestedCost, generateTransactionId, getDistanceKm, getMatchingDonors } from "../services/matching";
import { getCurrentLocation } from "../services/location";
import { keys, readJson, writeJson } from "../services/storage";
import type {
  AppUser,
  BloodType,
  EmergencyRequest,
  PaymentRecord,
  UrgencyLevel,
  UserRole
} from "../types/models";

type Session = {
  userId: string;
};

type SignupPayload = {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  bloodType?: BloodType;
  facility?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type CreateRequestPayload = {
  bloodType: BloodType;
  urgency: UrgencyLevel;
  radiusKm: number;
};

type PayPayload = {
  requestId: string;
  donorId: string;
  phone: string;
  amount: number;
  transactionId?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  responseDescription?: string;
};

type AppContextValue = {
  currentUser?: AppUser;
  users: AppUser[];
  requests: EmergencyRequest[];
  payments: PaymentRecord[];
  selectedRole: UserRole;
  booting: boolean;
  loading: boolean;
  error?: string;
  setSelectedRole: (role: UserRole) => Promise<void>;
  signUp: (payload: SignupPayload) => Promise<boolean>;
  login: (payload: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateAvailability: (available: boolean) => Promise<void>;
  createRequest: (payload: CreateRequestPayload) => Promise<void>;
  respondToRequest: (requestId: string) => Promise<void>;
  markFulfilled: (requestId: string) => Promise<void>;
  payForTransport: (payload: PayPayload) => Promise<PaymentRecord>;
  donorMatches: EmergencyRequest[];
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const defaultDonorA: AppUser = {
  id: "demo-donor-1",
  role: "donor",
  email: "donor.a@lifelink.app",
  password: "password123",
  name: "Demo Donor A",
  bloodType: "O+",
  availability: true,
  location: {
    latitude: -1.2864,
    longitude: 36.8172,
    updatedAt: new Date().toISOString()
  }
};

const defaultDonorB: AppUser = {
  id: "demo-donor-2",
  role: "donor",
  email: "donor.b@lifelink.app",
  password: "password123",
  name: "Demo Donor B",
  bloodType: "A+",
  availability: true,
  location: {
    latitude: -1.2921,
    longitude: 36.8219,
    updatedAt: new Date().toISOString()
  }
};

const defaultHospital: AppUser = {
  id: "demo-hospital-1",
  role: "hospital",
  email: "hospital@lifelink.app",
  password: "password123",
  name: "CityCare Hospital",
  facility: "Main Wing",
  availability: true,
  location: {
    latitude: -1.2833,
    longitude: 36.8167,
    updatedAt: new Date().toISOString()
  }
};

function fakeDelay(ms = 900): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function AppProvider({ children }: PropsWithChildren) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [selectedRole, setSelectedRoleState] = useState<UserRole>("donor");
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    async function bootstrap() {
      const [storedUsers, storedRequests, storedPayments, storedSession, storedRole] =
        await Promise.all([
          readJson<AppUser[]>(keys.users, []),
          readJson<EmergencyRequest[]>(keys.requests, []),
          readJson<PaymentRecord[]>(keys.payments, []),
          readJson<Session | undefined>(keys.session, undefined),
          readJson<UserRole>(keys.selectedRole, "donor")
        ]);

      if (storedUsers.length === 0) {
        const seeded = [defaultDonorA, defaultDonorB, defaultHospital];
        setUsers(seeded);
        await writeJson(keys.users, seeded);
      } else {
        setUsers(storedUsers);
      }

      setRequests(storedRequests);
      setPayments(storedPayments);
      setSession(storedSession);
      setSelectedRoleState(storedRole);
      setBooting(false);
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!booting) {
      void writeJson(keys.users, users);
    }
  }, [users, booting]);

  useEffect(() => {
    if (!booting) {
      void writeJson(keys.requests, requests);
    }
  }, [requests, booting]);

  useEffect(() => {
    if (!booting) {
      void writeJson(keys.payments, payments);
    }
  }, [payments, booting]);

  useEffect(() => {
    if (!booting) {
      void writeJson(keys.session, session);
    }
  }, [session, booting]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasBackground = /inactive|background/.test(appState.current);
      if (wasBackground && nextState === "active") {
        void refreshLocationForCurrentUser();
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  });

  const currentUser = useMemo(() => users.find((item) => item.id === session?.userId), [users, session]);

  const donorMatches = useMemo(() => {
    if (!currentUser || currentUser.role !== "donor" || !currentUser.location || !currentUser.bloodType) {
      return [];
    }

    return requests.filter((request) => {
      if (request.status !== "open" || !request.location) {
        return false;
      }
      if (!currentUser.availability) {
        return false;
      }
      const donor = getMatchingDonors({
        donors: [currentUser],
        requestedBloodType: request.bloodType,
        hospitalLocation: request.location,
        radiusKm: 10
      });
      return donor.length === 1;
    });
  }, [currentUser, requests]);

  async function refreshLocationForCurrentUser(): Promise<void> {
    if (!session?.userId) {
      return;
    }
    const location = await getCurrentLocation();
    if (!location) {
      return;
    }
    setUsers((prev) => prev.map((user) => (user.id === session.userId ? { ...user, location } : user)));
  }

  async function setSelectedRole(role: UserRole): Promise<void> {
    setSelectedRoleState(role);
    await writeJson(keys.selectedRole, role);
  }

  function clearError() {
    setError(undefined);
  }

  async function signUp(payload: SignupPayload): Promise<boolean> {
    setLoading(true);
    setError(undefined);
    await fakeDelay();

    const existing = users.find((item) => item.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      setLoading(false);
      setError("That email already exists. Please log in instead.");
      return false;
    }

    const location = await getCurrentLocation();

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      role: payload.role,
      email: payload.email.trim(),
      password: payload.password,
      name: payload.name.trim(),
      bloodType: payload.bloodType,
      facility: payload.facility,
      availability: true,
      location
    };

    setUsers((prev) => [newUser, ...prev]);
    setSession({ userId: newUser.id });
    setLoading(false);
    return true;
  }

  async function login(payload: LoginPayload): Promise<boolean> {
    setLoading(true);
    setError(undefined);
    await fakeDelay();

    const found = users.find(
      (item) =>
        item.email.toLowerCase() === payload.email.trim().toLowerCase() &&
        item.password === payload.password
    );

    if (!found) {
      setLoading(false);
      setError("Invalid credentials. Try demo accounts or sign up.");
      return false;
    }

    setSession({ userId: found.id });
    setSelectedRoleState(found.role);
    await writeJson(keys.selectedRole, found.role);
    setLoading(false);
    await refreshLocationForCurrentUser();
    return true;
  }

  async function logout(): Promise<void> {
    setSession(undefined);
  }

  async function updateAvailability(available: boolean): Promise<void> {
    if (!currentUser) {
      return;
    }
    setUsers((prev) =>
      prev.map((user) => (user.id === currentUser.id ? { ...user, availability: available } : user))
    );
  }

  async function createRequest(payload: CreateRequestPayload): Promise<void> {
    if (!currentUser || currentUser.role !== "hospital") {
      return;
    }

    const hospitalLocation = currentUser.location ?? (await getCurrentLocation());
    if (!hospitalLocation) {
      setError("Location permission is required to create emergency requests.");
      return;
    }

    if (!currentUser.location) {
      setUsers((prev) =>
        prev.map((user) => (user.id === currentUser.id ? { ...user, location: hospitalLocation } : user))
      );
    }

    const donors = users.filter((user) => user.role === "donor");
    const matches = getMatchingDonors({
      donors,
      requestedBloodType: payload.bloodType,
      hospitalLocation,
      radiusKm: payload.radiusKm
    });

    const nearestDistance = matches
      .map((donor) =>
        donor.location ? getDistanceKm(donor.location, hospitalLocation) : Number.POSITIVE_INFINITY
      )
      .sort((a, b) => a - b)[0];

    const nearestDistanceKm =
      typeof nearestDistance === "number" && Number.isFinite(nearestDistance)
        ? nearestDistance
        : payload.radiusKm;

    const suggestedTransportAmount = calculateSuggestedCost(nearestDistanceKm, payload.urgency);

    const request: EmergencyRequest = {
      id: `req-${Date.now()}`,
      hospitalId: currentUser.id,
      hospitalName: currentUser.name,
      bloodType: payload.bloodType,
      urgency: payload.urgency,
      status: "open",
      location: hospitalLocation,
      matchedDonorIds: matches.map((item) => item.id),
      matchedCount: matches.length,
      responderIds: [],
      createdAt: new Date().toISOString(),
      suggestedTransportAmount
    };

    setRequests((prev) => [request, ...prev]);
  }

  async function respondToRequest(requestId: string): Promise<void> {
    if (!currentUser || currentUser.role !== "donor") {
      return;
    }

    setRequests((prev) =>
      prev.map((request) => {
        if (request.id !== requestId) {
          return request;
        }
        if (request.responderIds.includes(currentUser.id)) {
          return request;
        }
        return { ...request, responderIds: [...request.responderIds, currentUser.id] };
      })
    );
  }

  async function markFulfilled(requestId: string): Promise<void> {
    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: "fulfilled" } : request))
    );
  }

  async function payForTransport(payload: PayPayload): Promise<PaymentRecord> {
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      requestId: payload.requestId,
      donorId: payload.donorId,
      phone: payload.phone,
      amount: payload.amount,
      transactionId: payload.transactionId ?? generateTransactionId(),
      checkoutRequestId: payload.checkoutRequestId,
      merchantRequestId: payload.merchantRequestId,
      responseDescription: payload.responseDescription,
      createdAt: new Date().toISOString()
    };

    setPayments((prev) => [payment, ...prev]);
    return payment;
  }

  const value: AppContextValue = {
    currentUser,
    users,
    requests,
    payments,
    selectedRole,
    booting,
    loading,
    error,
    setSelectedRole,
    signUp,
    login,
    logout,
    clearError,
    updateAvailability,
    createRequest,
    respondToRequest,
    markFulfilled,
    payForTransport,
    donorMatches
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
