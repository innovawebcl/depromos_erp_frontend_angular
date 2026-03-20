import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { BackofficeApi } from '@infra-adapters/services/backoffice-api.service';
import { firstValueFrom } from 'rxjs';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
} from '@coreui/angular-pro';
import { IconComponent } from '@coreui/icons-angular';

declare var Chart: any;

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    IconComponent,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private authManager = inject(AuthManager);
  private api = inject(BackofficeApi);

  userName = '';

  // Stats counters
  totalOrders = 0;
  totalProducts = 0;
  totalCustomers = 0;
  totalCouriers = 0;
  totalRevenue = 0;
  pendingOrders = 0;
  enRouteOrders = 0;
  deliveredOrders = 0;

  // Chart
  @ViewChild('salesChart', { static: false }) salesChartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: any = null;
  chartDays = 30;
  chartFrom = '';
  chartTo = '';

  ngOnInit(): void {
    const userSession = this.authManager.UserSessionData();
    if (userSession) {
      this.userName = `${userSession.first_name ?? ''} ${userSession.last_name ?? ''}`.trim();
    }

    // Set default date range: last 30 days
    const now = new Date();
    this.chartTo = this.toDateStr(now);
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    this.chartFrom = this.toDateStr(from);

    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.loadChartScript().then(() => this.loadChart());
  }

  async loadStats(): Promise<void> {
    try {
      const stats: any = await firstValueFrom(this.api.get('/dashboard/stats'));
      this.totalOrders = stats.total_orders ?? 0;
      this.totalProducts = stats.total_products ?? 0;
      this.totalCustomers = stats.total_customers ?? 0;
      this.totalCouriers = stats.total_couriers ?? 0;
      this.totalRevenue = stats.total_revenue ?? 0;
      this.pendingOrders = stats.pending_orders ?? 0;
      this.enRouteOrders = stats.en_route_orders ?? 0;
      this.deliveredOrders = stats.delivered_orders ?? 0;
    } catch (e) {
      console.error('Error loading dashboard stats', e);
    }
  }

  async loadChart(): Promise<void> {
    try {
      const data: any = await firstValueFrom(
        this.api.get(`/dashboard/sales-chart?from=${this.chartFrom}&to=${this.chartTo}`)
      );
      const labels = (data.data || []).map((d: any) => this.formatDateLabel(d.date));
      const values = (data.data || []).map((d: any) => d.total);

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const canvas = this.salesChartRef?.nativeElement;
      if (!canvas) return;

      this.chartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Ventas ($)',
            data: values,
            backgroundColor: 'rgba(0, 153, 204, 0.6)',
            borderColor: '#0099cc',
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => `$${ctx.parsed.y?.toLocaleString('es-CL') ?? 0}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (v: number) => `$${v.toLocaleString('es-CL')}`
              }
            }
          }
        }
      });
    } catch (e) {
      console.error('Error loading sales chart', e);
    }
  }

  onDateRangeChange(): void {
    this.loadChart();
  }

  setQuickRange(days: number): void {
    const now = new Date();
    this.chartTo = this.toDateStr(now);
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    this.chartFrom = this.toDateStr(from);
    this.chartDays = days;
    this.loadChart();
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private formatDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
  }

  private loadChartScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  formatCurrency(value: number): string {
    return '$' + (value || 0).toLocaleString('es-CL');
  }
}
