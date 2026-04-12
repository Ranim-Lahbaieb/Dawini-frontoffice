
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProfileComponent as ProfileDetailComponent } from '../../shared/components/profile-user/profile.component';

@Component({
  selector: 'app-profile-page',
  imports: [
    PageBreadcrumbComponent,
    ProfileDetailComponent
],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {

}
