import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {


  sidebarOpen = window.innerWidth > 768;
  showLogoutConfirm = false;
  currentRoute = '';

  navItems: any[] = [
    { label: 'Dashboard', icon: '🏠', route: '/dashboard', roles: ['admin', 'student', 'company'] },
    { label: 'Students', icon: '🎓', route: '/students', roles: ['admin'] },
    { label: 'Companies', icon: '🏢', route: '/companies', roles: ['admin'] },
    { label: 'Jobs', icon: '💼', route: '/jobs', roles: ['admin', 'student', 'company'] },
    { label: 'Applications', icon: '📋', route: '/applications', roles: ['admin', 'student', 'company'] },
    { label: 'Placement', icon: '🏆', route: '/placement', roles: ['admin'] },
    { label: 'Profile', icon: '👤', route: '/profile', roles: ['admin', 'student', 'company'] },
    { label: 'Notifications', icon: '🔔', route: '/notification', roles: ['admin', 'student', 'company'] },
    { label: 'Reports', icon: '📊', route: '/reports', roles: ['admin'] },
    {
      label: 'Offer Letter',
      route: '/offerletter',
      icon: '📧',
      roles: ['admin', 'company']
    },
    { label: 'Settings', icon: '⚙️', route: '/settings', roles: ['admin'] },


  ];

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentRoute = e.url);
  }

  get filteredNav(): any[] {
    const role = this.auth.getRole() ?? '';
    return this.navItems.filter(n => n.roles.includes(role));
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

 // Open logout confirmation
  confirmLogout(): void {

    this.showLogoutConfirm = true;

  }

  // Cancel logout
  cancelLogout(): void {

    this.showLogoutConfirm = false;

  }

  // Confirm logout
  confirmLogoutAction(): void {

    this.showLogoutConfirm = false;

    this.auth.logout();

  }


  get user() { return this.auth.getCurrentUser(); }
}
