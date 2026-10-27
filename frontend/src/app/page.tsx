"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChartComponent } from "@/components/charts";
import { mockDashboardStats } from "@/lib/mockData";
import { formatNumber, formatPercentage, cn } from "@/lib/utils";
import {
  FileText,
  Briefcase,
  Target,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const statCards = [
  {
    title: "Total Resumes Screened",
    value: mockDashboardStats.totalResumesScreened,
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    trend: "+12% from last month",
    trendIcon: TrendingUp,
  },
  {
    title: "Active Job Openings",
    value: mockDashboardStats.activeJobOpenings,
    icon: Briefcase,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    trend: "3 new this week",
    trendIcon: TrendingUp,
  },
  {
    title: "Average Match Score",
    value: formatPercentage(mockDashboardStats.averageMatchScore),
    icon: Target,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    trend: "+5% improvement",
    trendIcon: TrendingUp,
  },
  {
    title: "Fairness Score",
    value: formatPercentage(mockDashboardStats.fairnessScore),
    icon: ShieldCheck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    trend: "Above threshold",
    trendIcon: CheckCircle,
  },
];

const recentScreenings = [
  { job: "Senior Frontend Engineer", candidates: 45, matches: 12, status: "completed", time: "2 hours ago" },
  { job: "Data Scientist", candidates: 32, matches: 8, status: "completed", time: "5 hours ago" },
  { job: "Product Manager", candidates: 28, matches: 7, status: "completed", time: "1 day ago" },
  { job: "DevOps Engineer", candidates: 19, matches: 4, status: "processing", time: "2 days ago" },
  { job: "Backend Engineer", candidates: 41, matches: 15, status: "completed", time: "3 days ago" },
];

const matchScoreDistribution = [
  { range: "90-100%", count: 23 },
  { range: "80-89%", count: 45 },
  { range: "70-79%", count: 67 },
  { range: "60-69%", count: 42 },
  { range: "50-59%", count: 18 },
  { range: "Below 50%", count: 12 },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your resume screening pipeline and fairness metrics
            </p>
          </div>
          <Badge variant="success" className="text-sm">
            <Activity className="mr-1.5 h-3 w-3 animate-pulse" />
            Live Demo Data
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={cn("h-5 w-5", stat.color)} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                  <stat.trendIcon className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{stat.trend}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Match Score Distribution
                <Badge variant="outline" className="text-xs">Demo Data</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={matchScoreDistribution}
                xKey="range"
                yKeys={["count"]}
                colors={["#10b981"]}
                height={300}
                showLegend={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Screening Activity
                <Badge variant="outline" className="text-xs">Last 5 Screenings</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScreenings.map((screening) => (
                  <div key={screening.job} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium">{screening.job}</p>
                        <p className="text-sm text-muted-foreground">
                          {screening.candidates} candidates • {screening.matches} strong matches
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge
                        variant={
                          screening.status === "completed" ? "success" :
                          screening.status === "processing" ? "warning" : "destructive"
                        }
                      >
                        {screening.status}
                      </Badge>
                      <span className="text-muted-foreground">{screening.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Screening Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Resumes Received</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pre-screened by AI</span>
                    <span className="font-medium">1,182</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Human Review Completed</span>
                    <span className="font-medium">892</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Final Decisions Made</span>
                    <span className="font-medium">567</span>
                  </div>
                  <Progress value={64} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Fairness Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Demographic Parity</span>
                  <span className="font-medium text-emerald-500">Pass</span>
                </div>
                <Progress value={87} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Difference: 0.12 (threshold: 0.20)</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Equalized Odds</span>
                  <span className="font-medium text-emerald-500">Pass</span>
                </div>
                <Progress value={92} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Difference: 0.08 (threshold: 0.15)</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Selection Rate Parity</span>
                  <span className="font-medium text-amber-500">Monitor</span>
                </div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Difference: 0.18 (threshold: 0.15)</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Fairness metrics computed on synthetic demo data. Connect to real pipeline for production audit.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}