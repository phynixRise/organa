export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  account: {
    id: string;
    email: string;
    fullName: string | null;
  };
};

export type OrgSwitcherItem = {
  id: string;
  name: string;
  businessType: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
