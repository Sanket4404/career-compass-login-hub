
import React from 'react';
import { UserProfile } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Mail, Calendar, UserCircle } from 'lucide-react';

interface UserCardProps {
  user: UserProfile;
  onClick: () => void;
}

export const UserCard = ({ user, onClick }: UserCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="bg-primary/10 p-4 rounded-full mb-3">
            <UserCircle className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-medium text-lg">{user.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
            <Mail className="h-3 w-3" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 px-6 py-3">
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full" 
          onClick={onClick}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
