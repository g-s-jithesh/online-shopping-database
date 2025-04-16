export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      app_user: {
        Row: {
          user_id: string
          user_name: string | null
          user_email: string | null
          user_address: string | null
          user_mobile: string | null
          user_pincode: string | null
          user_cart: Json | null
          user_wish_list: Json | null
          user_role: string | null
        }
        Insert: {
          user_id: string
          user_name?: string | null
          user_email?: string | null
          user_address?: string | null
          user_mobile?: string | null
          user_pincode?: string | null
          user_cart?: Json | null
          user_wish_list?: Json | null
          user_role?: string | null
        }
        Update: {
          user_id?: string
          user_name?: string | null
          user_email?: string | null
          user_address?: string | null
          user_mobile?: string | null
          user_pincode?: string | null
          user_cart?: Json | null
          user_wish_list?: Json | null
          user_role?: string | null
        }
      }
      client: {
        Row: {
          client_no: number
          client_name: string | null
          client_email: string | null
          client_address: string | null
          client_city: string | null
          client_pincode: string | null
          client_mobile: string | null
          user_id: string | null
        }
        Insert: {
          client_no: number
          client_name?: string | null
          client_email?: string | null
          client_address?: string | null
          client_city?: string | null
          client_pincode?: string | null
          client_mobile?: string | null
          user_id?: string | null
        }
        Update: {
          client_no?: number
          client_name?: string | null
          client_email?: string | null
          client_address?: string | null
          client_city?: string | null
          client_pincode?: string | null
          client_mobile?: string | null
          user_id?: string | null
        }
      }
      payment: {
        Row: {
          p_id: number
          p_date: string | null
          p_amt: number | null
          p_details: string | null
          p_customer_id: string | null
          order_no: number | null
        }
        Insert: {
          p_id: number
          p_date?: string | null
          p_amt?: number | null
          p_details?: string | null
          p_customer_id?: string | null
          order_no?: number | null
        }
        Update: {
          p_id?: number
          p_date?: string | null
          p_amt?: number | null
          p_details?: string | null
          p_customer_id?: string | null
          order_no?: number | null
        }
      }
      product_master: {
        Row: {
          product_no: number
          product_price: number | null
          quantity_available: number | null
          product_type: string | null
          p_description: string | null
          product_sales: string | null
          p_details: string | null
          product_image: string | null
        }
        Insert: {
          product_no: number
          product_price?: number | null
          quantity_available?: number | null
          product_type?: string | null
          p_description?: string | null
          product_sales?: string | null
          p_details?: string | null
          product_image?: string | null
        }
        Update: {
          product_no?: number
          product_price?: number | null
          quantity_available?: number | null
          product_type?: string | null
          p_description?: string | null
          product_sales?: string | null
          p_details?: string | null
          product_image?: string | null
        }
      }
      sales_order: {
        Row: {
          order_no: number
          order_date: string | null
          salesman_no: number | null
          client_no: number | null
          user_id: string | null
          order_status: string | null
        }
        Insert: {
          order_no: number
          order_date?: string | null
          salesman_no?: number | null
          client_no?: number | null
          user_id?: string | null
          order_status?: string | null
        }
        Update: {
          order_no?: number
          order_date?: string | null
          salesman_no?: number | null
          client_no?: number | null
          user_id?: string | null
          order_status?: string | null
        }
      }
      sales_order_details: {
        Row: {
          order_no: number
          product_no: number
          quantity_no: number | null
          amt: number | null
        }
        Insert: {
          order_no: number
          product_no: number
          quantity_no?: number | null
          amt?: number | null
        }
        Update: {
          order_no?: number
          product_no?: number
          quantity_no?: number | null
          amt?: number | null
        }
      }
      salesman_master: {
        Row: {
          salesman_no: number
          salesman_name: string | null
          salesman_pincode: string | null
          salesman_city: string | null
          salesman_phone_no: string | null
          user_id: string | null
        }
        Insert: {
          salesman_no: number
          salesman_name?: string | null
          salesman_pincode?: string | null
          salesman_city?: string | null
          salesman_phone_no?: string | null
          user_id?: string | null
        }
        Update: {
          salesman_no?: number
          salesman_name?: string | null
          salesman_pincode?: string | null
          salesman_city?: string | null
          salesman_phone_no?: string | null
          user_id?: string | null
        }
      }
    }
  }
}
