import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'app/shared/services/service.service';
import { StorageService } from 'app/shared/services/storage.service';

@Component({
  selector: 'app-confirm-update-password',
  templateUrl: './confirm-update-password.component.html',
  styleUrls: ['./confirm-update-password.component.scss']
})
export class ConfirmUpdatePasswordComponent implements OnInit {

  constructor(
    private storage: StorageService,
    private service: ServiceService
  ) { 
    
  }

  ngOnInit(): void {
    if (this.storage.getUserInfo()) {
      this.storage.clearUserInfo();
      location.reload();
    }
  }

}
