"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [bots, setBots] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated");
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    // Fetch data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [botsRes, usersRes] = await Promise.all([
          fetch("/api/admin/bots"),
          fetch("/api/admin/users"),
        ]);
        
        const botsData = await botsRes.json();
        const usersData = await usersRes.json();
        
        setBots(botsData);
        setUsers(usersData);
      } catch (e) {
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    router.push("/admin/login");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      <Tabs defaultValue="bots" className="w-full">
        <TabsList>
          <TabsTrigger value="bots">Companions/Bots</TabsTrigger>
          <TabsTrigger value="users">Users Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bots">
          <DataTable
            columns={[
              { accessorKey: "name", header: "Name" },
              { accessorKey: "userName", header: "Creator" },
              { 
                accessorKey: "private",
                header: "Private",
                cell: ({ row }) => (
                  <Badge variant={row.original.private ? "destructive" : "secondary"}>
                    {row.original.private ? "Yes" : "No"}
                  </Badge>
                )
              },
              { 
                accessorKey: "createdAt", 
                header: "Created",
                cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
              },
              {
                accessorKey: "actions",
                header: "Actions",
                cell: ({ row }) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/companion/${row.original.id}`)}
                      className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm hover:opacity-90 transition"
                    >
                      Modify
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this bot?")) {
                          await fetch(`/api/admin/bots/${row.original.id}`, {
                            method: "DELETE",
                          });
                          // Refresh the data
                          window.location.reload();
                        }
                      }}
                      className="bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm hover:opacity-90 transition"
                    >
                      Delete
                    </button>
                  </div>
                )
              }
            ]}
            data={bots}
          />
        </TabsContent>
        
        <TabsContent value="users">
          <DataTable
            columns={[
              { accessorKey: "email", header: "Email" },
              { accessorKey: "totalSpent", header: "Total Spent" },
              { accessorKey: "availableTokens", header: "Available Tokens" },
              { accessorKey: "createdAt", header: "Join Date" },
            ]}
            data={users}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 