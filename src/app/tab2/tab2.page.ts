import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

<<<<<<< HEAD
=======
  // Bonus 1: Celkový součet hodnot
  totalSum = computed(() => {
    return this.counterService.counters().reduce((sum, item) => sum + item.value, 0);
  });

  // Varianta A: Průměr hodnot (zaokrouhlený na 2 desetinná místa)
  // https://tools.keycdn.com/sha256-online-generator
  // SHA 037177751225837e6fdfac387f4059aa26370526a94c817e6dad3a83d112866e
  averageValue = computed(() => {
    const list = this.counterService.counters();
    if (list.length === 0) return 0;
    return Number((this.totalSum() / list.length).toFixed(2));
  });

  filteredCounters = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const sort = this.sortBy();
    let list = [...this.counterService.counters()];

    if (term) {
      list = list.filter((item) => item.name.toLowerCase().includes(term));
    }

    // sorting :)
    return list.sort((a, b) => {
      if (sort === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sort === 'value') {
        return b.value - a.value;
      }
      return 0;
    });
  });

  // Smazání jednoho záznamu + Toast notifikace
>>>>>>> cc9cf5e (Dokončení CV4 + bonusy)
  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
  }

<<<<<<< HEAD
  async clear(): Promise<void> {
    await this.counterService.clear();
=======
  async confirmClear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Potvrzení mazání',
      message: 'Opravdu chcete vymazat celou historii počítadel?',
      buttons: [
        {
          text: 'Zrušit',
          role: 'cancel',
        },
        {
          text: 'Vymazat',
          handler: async () => {
            await this.counterService.clear();
            this.showToast('Historie byla vymazána.');
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
>>>>>>> cc9cf5e (Dokončení CV4 + bonusy)
  }
}