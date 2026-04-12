import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-oauth2-success',
  template: `<p>Connexion Google...</p>`
})
export class Oauth2SuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const token = params['token'];

      if (token) {

        localStorage.setItem('token', token);

        this.router.navigate(['/users']);

      } else {

        this.router.navigate(['/signin']);

      }

    });

  }

}