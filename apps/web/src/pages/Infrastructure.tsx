import React from 'react';
import { Server, Box, Layers, Shield, Cloud, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export const InfrastructurePage: React.FC = () => {
  const pods = [
    { name: 'web-frontend-7f9a8b-4c12', status: 'Running', restarts: 0, age: '4d 12h', cpu: '45m / 200m', mem: '128Mi / 512Mi' },
    { name: 'web-frontend-7f9a8b-9d33', status: 'Running', restarts: 0, age: '4d 12h', cpu: '42m / 200m', mem: '132Mi / 512Mi' },
    { name: 'api-backend-86c5df-1a44', status: 'Running', restarts: 0, age: '2d 8h', cpu: '85m / 500m', mem: '256Mi / 1Gi' },
    { name: 'api-backend-86c5df-7e99', status: 'Running', restarts: 0, age: '2d 8h', cpu: '90m / 500m', mem: '260Mi / 1Gi' },
    { name: 'postgres-db-0', status: 'Running', restarts: 0, age: '14d', cpu: '110m / 1000m', mem: '512Mi / 2Gi' },
  ];

  const terraformResources = [
    { name: 'aws_vpc.devopshub_vpc', type: 'VPC & Subnets', status: 'PROVISIONED', region: 'us-east-1' },
    { name: 'aws_eks_cluster.main', type: 'Amazon EKS', status: 'PROVISIONED', region: 'us-east-1' },
    { name: 'aws_ecr_repository.apps', type: 'Amazon ECR', status: 'PROVISIONED', region: 'us-east-1' },
    { name: 'aws_iam_role.eks_nodes', type: 'IAM Least-Privilege Role', status: 'PROVISIONED', region: 'us-east-1' },
    { name: 'aws_security_group.k8s', type: 'Security Group', status: 'PROVISIONED', region: 'us-east-1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Cloud Infrastructure & Kubernetes Engine
          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono px-2.5 py-0.5 rounded-full">
            AWS EKS + Terraform IaC
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Inspect live Kubernetes pod replicas, Amazon ECR container registries, and Terraform state.
        </p>
      </div>

      {/* Kubernetes Pods Grid */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-400" /> Kubernetes Workload Pods (namespace: devopshub-prod)
          </h2>
          <Badge variant="SUCCESS" label="5/5 Pods Ready" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
                <th className="py-3 px-4">Pod Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Restarts</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">CPU Requests/Limits</th>
                <th className="py-3 px-4">Memory Requests/Limits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {pods.map((pod) => (
                <tr key={pod.name} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 text-blue-400 font-semibold">{pod.name}</td>
                  <td className="py-3 px-4"><Badge variant="SUCCESS" label={pod.status} /></td>
                  <td className="py-3 px-4 text-slate-400">{pod.restarts}</td>
                  <td className="py-3 px-4 text-slate-400">{pod.age}</td>
                  <td className="py-3 px-4">{pod.cpu}</td>
                  <td className="py-3 px-4">{pod.mem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terraform IaC State visualizer */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-purple-400" /> Terraform Infrastructure as Code State
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terraformResources.map((res) => (
            <div key={res.name} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-purple-400 font-semibold">{res.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-300">{res.type}</div>
              <div className="text-[11px] text-slate-500 font-mono">Region: {res.region}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
