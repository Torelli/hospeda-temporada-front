import { Component, OnInit } from '@angular/core';
import { ReservaService } from './services/reserva.service';
import { Reserva } from './models/reserva';
import { NgForm } from '@angular/forms';
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import compareAsc from 'date-fns/compareAsc'
import parseISO from 'date-fns/parseISO';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  reserva = {} as Reserva;
  reservas: Reserva[] = [];

  constructor(private reservaService: ReservaService) { }

  ngOnInit(): void {
    this.findAllReservas();
  }

  saveReserva(form: NgForm) {
    if (this.reserva.id !== undefined) {
      this.atualizaReserva(form);
    } else {
      this.createReserva(form);
    }
  }

  createReserva(form: NgForm) {
    if(!this.verificaDados()) {
        this.reservaService.create(this.reserva).subscribe(() => {
          this.cleanForm(form);
        });
    } else {
      alert(this.verificaDados());
    }    
  }

  atualizaReserva(form: NgForm) {
    if (!this.verificaDados()) {
      this.reservaService.update(this.reserva).subscribe(() => {
        this.cleanForm(form);
      });
    } else {
      alert(this.verificaDados());
    }
  }

  findAllReservas() {
    this.reservaService.findAll().subscribe((reservas: Reserva[]) => {
      this.reservas = reservas;
    });
  }

  cancelReserva(id: Number) {
    this.reservaService.cancel(id).subscribe(() => {
      this.findAllReservas();
    })
  }

  updateReserva(reserva: Reserva) {
    this.reserva = { ...reserva };
    this.abrirModal();
  }

  deleteAll() {
    this.reservaService.deleteAll().subscribe(() => {
      this.findAllReservas();
    })
  }

  cleanForm(form: NgForm) {
    this.findAllReservas();
    form.resetForm();
    this.reserva = {} as Reserva;
    const btnCloseDialog: HTMLElement | null = document.getElementById("btn-close-dialog");
    if (btnCloseDialog) btnCloseDialog.click();
  }

  verificaDatas() {
    const dataChegada: Date = parseISO(this.reserva.dataInicio.toString());
    const dataPartida: Date = parseISO(this.reserva.dataFim.toString());

    const datasComparadas:String|false = this.comparaDatas(dataChegada, dataPartida);
    if(datasComparadas) return datasComparadas;

    const intervaloDeDatas:String|false = this.checaIntervaloDeData(dataChegada, dataPartida);
    if(intervaloDeDatas) return intervaloDeDatas;

    return false;

    
  }

  comparaDatas(dataChegada: Date, dataPartida: Date) {
    const comparaDatas:number = compareAsc(dataChegada, dataPartida);
    if(comparaDatas == 1 || differenceInCalendarDays(dataChegada, dataPartida) == 0) {
      return "A data de chegada deve ser antes da data de partida";
    }
    return false;
  }

  checaIntervaloDeData(dataChegada: Date, dataPartida: Date) {
    const intervalo1: Interval = { start: dataChegada, end: dataPartida };
      for (let reservaAtual of this.reservas) {
        const intervalo2: Interval = { start: parseISO(reservaAtual.dataInicio.toString()), end: parseISO(reservaAtual.dataFim.toString()) };
        if (areIntervalsOverlapping(intervalo1, intervalo2) && this.reserva.id != reservaAtual.id) return `As datas estão em conflito com as datas da reserva de id: ${reservaAtual.id}`;
      }
      return false;
  }

  verificaNomeHospede() {
    if(this.reserva.nomeHospede == "null" || this.reserva.nomeHospede.match(/\d/)) {
      return "Nome inválido!";
    } else {
      return false;
    }
  }

  verificaDados() {
    if(this.verificaNomeHospede()) return this.verificaNomeHospede();
    if(this.verificaDatas()) return this.verificaDatas();
    return false;
  }

  abrirModal() {
    const modal: HTMLDialogElement | null = document.querySelector("#dialogNewReserva");
    const statusContainer: HTMLDivElement | null = document.querySelector("#status-container");
    const status: HTMLSelectElement | null = document.querySelector("#status");
    if (this.reserva.id !== undefined) {
      if (statusContainer) statusContainer.classList.remove("hidden");
      modal?.showModal();
    } else {
      if (statusContainer) statusContainer.classList.add("hidden");
      if (status) status.value = "CONFIRMADA";
      modal?.showModal();
    }
  }
}
