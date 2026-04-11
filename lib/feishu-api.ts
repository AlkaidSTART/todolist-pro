"use client";

import axios from 'axios';

const FEISHU_CLIENT_ID = process.env.FEISHU_CLIENT_ID || 'your_feishu_client_id';
const FEISHU_CLIENT_SECRET = process.env.FEISHU_CLIENT_SECRET || 'your_feishu_client_secret';
const FEISHU_REDIRECT_URI = process.env.FEISHU_REDIRECT_URI || 'http://localhost:3000/feishu/callback';

export interface FeishuEvent {
  summary: string;
  description: string;
  start_time: number;
  end_time: number;
  location?: string;
  attendees?: Array<{
    user_id: string;
    name: string;
  }>;
}

export interface FeishuToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

class FeishuAPI {
  private token: FeishuToken | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('feishu_token');
      const storedExpiry = localStorage.getItem('feishu_token_expiry');
      
      if (storedToken && storedExpiry) {
        this.token = JSON.parse(storedToken);
        this.tokenExpiry = parseInt(storedExpiry, 10);
      }
    }
  }

  private saveToken(token: FeishuToken) {
    this.token = token;
    this.tokenExpiry = Date.now() + (token.expires_in * 1000);
    if (typeof window !== 'undefined') {
      localStorage.setItem('feishu_token', JSON.stringify(token));
      localStorage.setItem('feishu_token_expiry', this.tokenExpiry.toString());
    }
  }

  private async refreshToken() {
    if (!this.token?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/refresh_access_token', {
      refresh_token: this.token.refresh_token,
      grant_type: 'refresh_token',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.saveToken(response.data.data);
  }

  private async ensureToken() {
    if (!this.token) {
      throw new Error('No token available. Please authenticate first.');
    }

    if (Date.now() >= this.tokenExpiry!) {
      await this.refreshToken();
    }

    return this.token.access_token;
  }

  getAuthUrl() {
    const params = new URLSearchParams({
      app_id: FEISHU_CLIENT_ID,
      redirect_uri: FEISHU_REDIRECT_URI,
      response_type: 'code',
      state: Math.random().toString(36).substring(2),
    });

    return `https://open.feishu.cn/open-apis/authen/v1/index?${params.toString()}`;
  }

  async getTokenFromCode(code: string) {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      app_id: FEISHU_CLIENT_ID,
      app_secret: FEISHU_CLIENT_SECRET,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const appToken = response.data.data.app_access_token;

    const userTokenResponse = await axios.post('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      code,
      grant_type: 'authorization_code',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appToken}`,
      },
    });

    this.saveToken(userTokenResponse.data.data);
    return userTokenResponse.data.data;
  }

  async getEvents(startTime: number, endTime: number): Promise<FeishuEvent[]> {
    const token = await this.ensureToken();

    const response = await axios.get('https://open.feishu.cn/open-apis/calendar/v4/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        start_time: startTime,
        end_time: endTime,
        page_size: 100,
      },
    });

    return response.data.data.items;
  }

  logout() {
    this.token = null;
    this.tokenExpiry = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('feishu_token');
      localStorage.removeItem('feishu_token_expiry');
    }
  }

  isAuthenticated() {
    return !!this.token && (this.tokenExpiry && Date.now() < this.tokenExpiry);
  }
}

export const feishuAPI = new FeishuAPI();