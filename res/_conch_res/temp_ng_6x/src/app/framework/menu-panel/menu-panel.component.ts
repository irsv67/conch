import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-menu-panel',
    templateUrl: './menu-panel.component.html',
    styleUrls: ['./menu-panel.component.css']
})
export class MenuPanelComponent implements OnInit {

    menuList: any = [
        // ====include_start====
        // ====include_end====
    ];

    constructor(private router: Router) {
    }

    ngOnInit() {
    }

    goPage(url: any) {
        this.router.navigateByUrl(url);
    }
}
