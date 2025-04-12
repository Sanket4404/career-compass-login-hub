
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCog, BarChart, GraduationCap, BookOpen, Award, Users, LogOut, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { careerService } from '@/services/careerService';
import { CareerAssessment } from '@/lib/supabase';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<CareerAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserAssessments = async () => {
      if (user) {
        setIsLoading(true);
        const { data, error } = await careerService.getUserAssessments(user.id);
        setIsLoading(false);
        
        if (!error && data) {
          setAssessments(data);
        }
      }
    };
    
    fetchUserAssessments();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <BrainCog className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Career Compass</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{profile?.name || user?.email}</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Admin
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="default" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
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
        
        {assessments.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4">Your Assessment History</h3>
            <div className="grid grid-cols-1 gap-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Career Assessment</CardTitle>
                    <CardDescription>
                      {new Date(assessment.assessment_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Top Skills</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {Object.entries(assessment.skills_assessment)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([skill, score]) => (
                              <li key={skill}>
                                {skill}: {score}/10
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommended Paths</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {assessment.recommended_paths.map((path) => (
                            <li key={path}>{path}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Assessment
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
