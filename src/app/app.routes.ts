import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LayoutComponent } from './base/layout/layout.component';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: 'register',
        component: RegisterComponent
    },

    {
        path: '',
        component: LayoutComponent,
        children: [

            {
                path: 'dashboard',
                loadComponent: () =>
                    import('../app/features/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },
            {
                path: 'students',
                loadComponent: () =>
                    import('../app/features/students/students.component')
                        .then(m => m.StudentsComponent)

            },
            {
                path: 'students/create',
                loadComponent: () =>
                    import('../app/features/students/student-create/student-create.component')
                        .then(m => m.StudentCreateComponent)
            },

            {
                path: 'students/edit/:id',

                loadComponent: () =>
                    import('../app/features/students/student-create/student-create.component')
                        .then(m => m.StudentCreateComponent)

            }, {
                path: 'companies',
                loadComponent: () =>
                    import('../app/features/companies/companies.component')
                        .then(m => m.CompaniesComponent),
                canActivate: [authGuard]
            },
            {
                path: 'jobs',
                loadComponent: () => import('../app/features/jobs/jobs.component').then(m => m.JobsComponent)
            },
            {
                path: 'applications',
                loadComponent: () => import('../app/features/applications/applications.component').then(m => m.ApplicationsComponent)
            },
            {
                path: 'placement',
                loadComponent: () =>
                    import('./features/placement/placement.component')
                        .then(m => m.PlacementComponent)
            },
            {
                path: 'profile',
                loadComponent: () =>
                    import('./features/profile/profile.component')
                        .then(m => m.ProfileComponent)
            },
            {
                path: 'notification',
                loadComponent: () =>
                    import('./features/notification/notification.component')
                        .then(m => m.NotificationComponent)
            },
            {
                path: 'reports',
                loadComponent: () =>
                    import('./features/reports/reports.component')
                        .then(m => m.ReportsComponent)
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./features/settings/settings.component')
                        .then(m => m.SettingsComponent)
            },
            {
                path: 'offerletter',
                loadComponent: () =>
                    import('./features/offerletter/offerletter.component')
                        .then(m => m.OfferletterComponent)
            }



        ]
    }

];