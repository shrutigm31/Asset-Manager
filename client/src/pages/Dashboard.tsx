import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { useLeads } from "@/hooks/use-leads";
import { useApplications } from "@/hooks/use-applications";
import { Users, FileText, CheckCircle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: applications, isLoading: appsLoading } = useApplications();

  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter(l => l.status === "New").length || 0;
  const totalApps = applications?.length || 0;
  const pendingApps = applications?.filter(a => a.status === "Under Review").length || 0;

  // Chart Data Preparation
  const programData = leads?.reduce((acc, lead) => {
    acc[lead.programInterest] = (acc[lead.programInterest] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(programData || {}).map(([name, count]) => ({
    name: name.split(" ")[0], // Shorten name
    count
  }));

  const COLORS = ['#6d28d9', '#d97706', '#9333ea', '#fbbf24'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="pt-14 md:pt-0 md:pl-64 transition-all duration-300">
        <div className="container mx-auto p-6 md:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">
              Executive Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of lead generation and application status.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Leads" 
              value={totalLeads} 
              description={`${newLeads} new leads this week`}
              icon={Users}
            />
            <StatCard 
              title="Active Applications" 
              value={totalApps} 
              description={`${pendingApps} under review`}
              icon={FileText}
            />
            <StatCard 
              title="Conversion Rate" 
              value="12.5%" 
              description="+2.1% from last month"
              icon={TrendingUp}
            />
            <StatCard 
              title="Closed Deals" 
              value={leads?.filter(l => l.status === "Closed").length || 0}
              description="Successfully enrolled"
              icon={CheckCircle}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads by Program */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-6 font-display">Leads by Program Interest</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#6d28d9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold mb-6 font-display">Application Status</h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Review', value: pendingApps },
                        { name: 'Interview', value: applications?.filter(a => a.status === "Interview Scheduled").length || 0 },
                        { name: 'Accepted', value: applications?.filter(a => a.status === "Accepted").length || 0 },
                        { name: 'Rejected', value: applications?.filter(a => a.status === "Rejected").length || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {barChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
