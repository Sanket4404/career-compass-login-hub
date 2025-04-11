
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCog, BarChart, GraduationCap, BookOpen, Award, Users } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <BrainCog className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Career Compass</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">Profile</Button>
          <Button variant="default">Sign Out</Button>
        </div>
      </header>
      
      <main>
        <h2 className="text-3xl font-bold mb-6">Welcome to Career Compass</h2>
        <p className="text-muted-foreground mb-8">
          Your AI-powered career guidance platform for computer science students
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Skill Assessment</CardTitle>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Analyze your current skills and get recommendations for improvement</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Assessment</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Career Paths</CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Explore potential career paths based on your interests and strengths</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Explore Paths</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Learning Resources</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Access personalized learning resources and courses</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Resources</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">CV Builder</CardTitle>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create and optimize your CV for your target career</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Build CV</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mentorship</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Connect with industry professionals for guidance</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Find Mentors</Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
