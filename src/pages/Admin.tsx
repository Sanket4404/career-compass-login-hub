
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { UserProfile, LoginActivity, supabase, setupRealtimeSubscriptions } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, Filter, SlidersHorizontal, LogOut, 
  BarChart, LayoutDashboard, UserCircle 
} from 'lucide-react';
import { UserTable } from '@/components/admin/UserTable';
import { UserCard } from '@/components/admin/UserCard';
import { UserStats } from '@/components/admin/UserStats';
import { LoginActivityChart } from '@/components/admin/LoginActivityChart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Set up real-time subscriptions when the component mounts
  useEffect(() => {
    setupRealtimeSubscriptions();
  }, []);

  // Query for user profiles
  const { 
    data: users = [], 
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  // Query for login activity
  const { 
    data: loginActivity = [], 
    isLoading: isLoadingActivity,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ['loginActivity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_activity')
        .select('*, profiles(*)')
        .order('login_time', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match our type
      return data.map(item => ({
        ...item,
        profiles: item.profiles as UserProfile
      })) as LoginActivity[];
    }
  });

  // Set up real-time listeners to refresh data
  useEffect(() => {
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        refetchUsers();
      })
      .subscribe();

    const loginChannel = supabase
      .channel('login-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'login_activity' 
      }, () => {
        refetchActivity();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(loginChannel);
    };
  }, [refetchUsers, refetchActivity]);

  const isLoading = isLoadingUsers || isLoadingActivity;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalUsers = users.length;
  const todayDate = new Date().toDateString();
  
  const activeUsersToday = new Set(
    loginActivity
      .filter(log => new Date(log.login_time).toDateString() === todayDate)
      .map(log => log.user_id)
  ).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <UserStats 
            totalUsers={totalUsers} 
            activeUsersToday={activeUsersToday} 
            totalLogins={loginActivity.length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Activity Over Time</CardTitle>
                <CardDescription>Number of user logins per day</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="flex items-center justify-center h-80">
                    <p>Loading activity data...</p>
                  </div>
                ) : (
                  <LoginActivityChart data={loginActivity} />
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <div className="flex border rounded-md overflow-hidden">
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="rounded-none"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="rounded-none"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="activity">Login Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              {isLoadingUsers ? (
                <div className="flex justify-center py-12">
                  <p>Loading user data...</p>
                </div>
              ) : viewMode === 'table' ? (
                <UserTable 
                  users={filteredUsers} 
                  onUserSelect={handleUserSelect} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map(user => (
                    <UserCard 
                      key={user.id} 
                      user={user} 
                      onClick={() => handleUserSelect(user)} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left">User</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Login Time</th>
                      <th className="py-3 px-4 text-left">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingActivity ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center">Loading activity data...</td>
                      </tr>
                    ) : loginActivity.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center">No login activity found</td>
                      </tr>
                    ) : (
                      loginActivity.map((activity, index) => (
                        <tr key={activity.id || index} className="border-b">
                          <td className="py-3 px-4">{activity.profiles?.name || 'Unknown'}</td>
                          <td className="py-3 px-4">{activity.profiles?.email || 'Unknown'}</td>
                          <td className="py-3 px-4">
                            {new Date(activity.login_time).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">{activity.ip_address}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">User Profile</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                  ✕
                </Button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">User ID:</span> {selectedUser.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Joined:</span> {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
                {selectedUser.last_login && (
                  <p className="text-sm">
                    <span className="font-medium">Last Login:</span> {new Date(selectedUser.last_login).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
