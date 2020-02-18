import { DateRangePicker } from "tiny-date-picker/dist/date-range-picker";

declare const document: Document;

export class RangePicker {
    display: boolean = !1;
    element: HTMLElement;
    dp: any;
    modal: HTMLElement;
    listeners: any[] = [];

    constructor(element: HTMLElement, selectorTimeDisplay: string){
        this.element = element;
        this.modal = document.createElement("div");
        this.modal.style.display = "none";
        this.modal.style.position = "absolute";
        this.modal.style.zIndex = "1000";
        this.modal.classList.add("daterangemodal");
        this.dp = DateRangePicker(this.modal);
        this.dp.on("statechange", (_, picker) => {
            if(picker.state.start && picker.state.end){
                this.listeners.map(l => {l(picker)})
                if(document&&document.querySelector(selectorTimeDisplay)){
                    Array.prototype.slice.call(document.querySelectorAll(selectorTimeDisplay)).forEach(l => {
                        l.textContent = `${picker.state.start.toDateString()} - ${picker.state.end.toDateString()}`;
                    })
                }
            }
        });
        document.body.appendChild(this.modal);
        document.addEventListener("click", this.toggle.bind(this));
    }

    private up(target: HTMLElement, source: HTMLElement): boolean{
        let current: HTMLElement = source;
        do{
            if(current == target)return !0;
        }while(current = current.parentElement)
        return!1;
    }

    add(listener: any){
        this.listeners.push(listener);
    }

    toggle(e: any){
        if(!this.display){
            if(this.up(this.element, e.target))
                this.display = !0, this.modal.style.top = e.clientY.toString(), this.modal.style.left = (e.clientX - 600).toString(), this.modal.style.display = "block";
        }else{
            if(!~e.path.indexOf(this.modal))
                this.display = !1, this.modal.style.display = "none";
        }
    }

    init(){
        let start = new Date();
        start.setDate(1);
        start.setMonth(start.getMonth() - 1);
        let end = new Date();
        end.setDate(0);
        this.dp.setState({
            start: start,
            end: end
        })
    }
}