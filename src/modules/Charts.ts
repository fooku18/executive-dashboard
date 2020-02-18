import { Options as ChartJsOptions } from "../types/ChartJsOptions";
import { FunnelGraphJsOptions } from "../types/FunnelGraphJsOptions";
import { Options as TableOptions } from "../types/TableOptions";
import { Options } from "../types/DataOptions";
import { IChart } from "../interfaces/IChart";
import { ChartDataModel, ChartModelRow } from "../types/ChartDataModel";
import { Chart } from "chart.js";
import { Dataset } from "../types/ChartJsDataType";
import FunnelGraph = require("funnel-graph-js");
const ChartDataLabels = require("chartjs-plugin-datalabels");

Chart.plugins.unregister(ChartDataLabels);

declare const document: Document;

export namespace Charts {
    export class Chartjs implements IChart{
        colorPalatte: string[] = ["#FFCC00", "#666666", "#FFE57F", "#B5B5B5", "#D1D1D1", "#E8E8E8", "#F2F2F2", "#D40511", "#323232"];
        options: ChartJsOptions;
        chart: Chart;

        constructor(){
            this.options = {
                general: {},
                datasets: [],
                type: "line",
                displayLabels: !1,
                percentageLabels: !1,
            }
        }

        applyOptions(options: Options): void {
            Object.keys(options)
                .filter(l => l.match(/chartjs/))
                .sort((a, b) => {
                    const an = a.split(".")[2];
                    const bn = b.split(".")[2];
                    if(Number(an) < Number(bn))return -1;
                    if(Number(an) > Number(bn))return 1;
                })
                .forEach(l => {
                    const [type, option, num, ...rest] = l.split(".");
                    if(option.match(/general|type/)){
                        this.options[option] = options[l];
                    }else if(option == "dataset"){
                        if(!num)
                            throw new SyntaxError("Number not defined on dataset attribute. You must define a number for each dataset option: data-options.chartjs.dataset.[#number]");
                        if(!this.options.datasets)
                            this.options.datasets = [];
                        this.options.datasets.push(<object>options[l]);
                    }else if(option == "labels")
                        this.options.displayLabels = !0;
                    else if(option == "percentage")
                        this.options.percentageLabels = !0;
                })
        }
        generateChart(data: ChartDataModel, chartElement: HTMLElement): void {
            let dataSets: Dataset[] = [];
            const labels: string[] = data.rows.map(l => l.label);

            for(let i = 0, j = data.columns.length; i < j; i++){
                const numbers = data.rows.map(l => l.data[i]);
                const label: string = data.columns[i];
                let dataSet = {
                    label: label,
                    data: numbers
                }
                if(this.options.datasets&&this.options.datasets[i])
                    dataSet = Object.assign(dataSet, this.options.datasets[i]);
                else{
                    let colorSettings;
                    if(data.type == "time" || data.rows.length == 1)
                        colorSettings = this.colorPalatte[i];
                    else
                        colorSettings = this.colorPalatte.slice(0, data.rows.length);
                    dataSet = Object.assign(dataSet, {backgroundColor: colorSettings, borderColor: "#FFFFFF"});
                }
                dataSets.push(dataSet);
            }

            if(!this.chart){
                if(!chartElement.querySelector("canvas"))
                    chartElement.appendChild(document.createElement("canvas"));
                this.chart = new Chart(chartElement.querySelector("canvas"), {
                    type: this.options.type,
                    data: {
                        labels: labels,
                        datasets: dataSets
                    },
                    plugins: this.options.displayLabels ? ChartDataLabels : null,
                    options: {
                        ...(this.options.displayLabels && 
                            {
                                plugins: {
                                datalabels: {
                                    color: "black",
                                    display: "auto",
                                    labels: {
                                        title: {
                                            font: {
                                                weight: "bold"
                                            }
                                        }
                                    },
                                    ...(this.options.percentageLabels && {
                                        formatter: (value: number, context: Chart) => 
                                            `${((value / context.dataset.data.reduce((acc: number, val: number) => acc+val, 0)) * 100).toFixed(0)}%`
                                        }||{})
                                }
                            }
                            } || {}),
                        ...(this.options["general"]||{})
                    }
                })
            }else{
                this.chart.data.datasets = dataSets; 
                this.chart.data.labels = labels;
                this.chart.update();
            }
        }
    }

    export class Table implements IChart{
        options: TableOptions;

        constructor(){
            this.options = {}
        }

        applyOptions(options: Options): void {
            Object.keys(options)
                .filter(l => l.match(/table/))
                .forEach(l => {
                    const [type, option, ...rest] = l.split(".");
                    this.options[option] = options[l];
                })
        }

        private applyClass(element: HTMLElement){
            const position: string = element.tagName.toLowerCase();
            if(this.options[position]){
                if(Array.isArray(this.options[position]))
                    this.options[position].forEach(l => element.classList.add(l));
                else
                    element.classList.add(this.options[position]);
            }
        }

        private generateHeader(columns: string[], dimensions: number): HTMLElement {
            const thead = document.createElement("thead");
            this.applyClass(thead);
            const tr = document.createElement("tr");
            const columnHeaders = columns.map(l => {
                const th = document.createElement("th");
                th.innerHTML = `<th scope="col">${l}</th>`;
                return th;
            });
            /**
             * Dimensions gt 1 signals that the data is breakdownable and not purely aggergate
             * on highest level. This will add an extra leading column to the table
             */
            if(dimensions > 1){
                const th = document.createElement("th");
                th.innerText = "Dimension";
                columnHeaders.unshift(th);
            }
            columnHeaders.forEach(l => tr.appendChild(l));
            thead.appendChild(tr);
            return thead;
        }

        private generateBody(rows: ChartModelRow[]): HTMLElement {
            const tbody = document.createElement("tbody");
            this.applyClass(tbody);
            for(let i = 0, j = rows.length; i < j; i++){
                const tr = document.createElement("tr");
                const cells = rows[i].data.map((l, i) => {
                    let td = document.createElement("td");
                    td.innerHTML = `<td scope="row">${l}</td>`;
                    return td;
                });
                if(j > 1){
                    const td = document.createElement("td");
                    td.innerHTML = rows[i].label;
                    cells.unshift(td);
                }
                cells.forEach(l => tr.appendChild(l));
                tbody.appendChild(tr);
            }
            return tbody;
        }

        generateChart(data: ChartDataModel, chartElement: HTMLElement): void {
            const table = document.createElement("table");
            table.classList.add("table");
            this.applyClass(table);
            table.appendChild(this.generateHeader(data.columns, data.rows.length));
            table.appendChild(this.generateBody(data.rows));
            chartElement.innerHTML = "";
            chartElement.appendChild(table);
        }
    }

    export class SummaryNumber implements IChart{
        formatter: string;

        private percentage(number: number): string {
            try{
                return `${(number * 100).toFixed(2)}%`;
            }catch(e){
                return number.toString();
            }
        }

        private time(number: number): string {
            try{
                let sec_num = number;
                let hours: number|string = Math.floor(sec_num / 3600);
                let minutes: number|string = Math.floor((sec_num - (hours * 3600)) / 60);
                let seconds: number|string = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

                if (hours   < 10) {hours   = "0"+hours;}
                if (minutes < 10) {minutes = "0"+minutes;}
                if (seconds < 10) {seconds = "0"+seconds;}
                return `${hours}:${minutes}:${seconds}`;
            }catch(e){
                return number.toString();
            }
        }

        private numberWithCommas(number: number): string {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        applyOptions(options: Options): void {
            if("summarynumber.formatter" in options)
                this.formatter = <string>options["summarynumber.formatter"];
        }

        generateChart(data: ChartDataModel, chartElement: HTMLElement): void {
            const fmt = this[this.formatter];
            if(chartElement.querySelector("[data-summarynumber]"))
                chartElement.querySelector("[data-summarynumber]").textContent = fmt ? fmt(data.rows[0].data[0]) : this.numberWithCommas(<number>data.rows[0].data[0]);
        }
    }

    export class FunnelGraphJsChart implements IChart{
        chartElement: HTMLElement;
        graph: FunnelGraph;
        options: FunnelGraphJsOptions;
        handlerRegistered: boolean = !1;
        colorPalette: string[][] = [
            ["#FFCC00", "#FFCC00c4"], 
            ["#666666", "#666666c4"], 
            ["#FFE57F", "#FFE57Fc4"], 
            ["#B5B5B5", "#B5B5B5c4"], 
            ["#D1D1D1", "#D1D1D1c4"], 
            ["#E8E8E8", "#E8E8E8c4"], 
            ["#F2F2F2", "#F2F2F2c4"], 
            ["#D40511", "#D40511c4"], 
            ["#323232", "#323232c4"]
        ];
        
        constructor(){
            this.options = {
                container: "",
                data: {
                    labels: [],
                    subLabels: [],
                    colors: [],
                    values: []
                }
            }
            const styleId = "__funnel_graph_js_customized_css";
            if(!document.querySelector(`.${styleId}`)){
                const style = document.createElement("style");
                style.innerHTML = `
                    .svg-funnel-js__label{
                        padding:0!important;
                    }
                    .svg-funnel-js .svg-funnel-js__labels .svg-funnel-js__label .label__value {
                        font-size: 16px;
                        color: #000;
                        line-height: 18px;
                        margin-bottom: 6px;
                    }
                    .svg-funnel-js .svg-funnel-js__subLabels .svg-funnel-js__subLabel {
                        color: #000;
                    }
                    .svg-funnel-js.svg-funnel-js--vertical{
                        padding: 0;
                    }
                    .svg-funnel-js .svg-funnel-js__labels .svg-funnel-js__label .label__title{
                        color: #000000bd;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        updateRects(element: HTMLElement){
            const style: CSSStyleDeclaration = window.getComputedStyle(element);
            const width: number = parseInt(style.width) - (parseInt(style.paddingLeft) + parseInt(style.paddingRight));
            this.graph.updateWidth(width);
            this.graph.updateHeight(width/2);
        }

        resizeHandler(event: Event){
            this.updateRects(this.chartElement.parentElement);
        }
        
        applyOptions(options: Options): void {
            Object.keys(options)
                .filter(l => l.match(/funnelgraphjs/))
                .forEach(l => {
                    const [type, option, num, ...rest] = l.split(".");
                    this.options = Object.assign(this.options, {[option]:options[l]}, this.options);
                });
        }

        generateChart(data: ChartDataModel, chartElement: HTMLElement): void {
            this.chartElement = chartElement;
            this.chartElement.addEventListener("click", this.resizeHandler.bind(this));
            if(!this.handlerRegistered)
                window.addEventListener("resize", this.resizeHandler.bind(this));

            if(!this.options.data.labels||!this.options.data.labels.length)
                this.options.data.labels = data.columns;
            
            if(!this.options.data.subLabels||!this.options.data.subLabels.length)
                (this.options.data.subLabels = data.rows.map(l => l.label));

            if(!this.options.data.values||!this.options.data.values.length)
                this.options.data.values = [];
                for(let i = 0, j = data.rows[0].data.length; i < j; i++)
                    this.options.data.values[i] = <number[]>data.rows.map(l => l.data[i]);

            if(!this.options.data.colors||!this.options.data.colors.length)
                this.options.data.colors = [];
                for(let i = 0, j = this.options.data.values[0].length; i < j; i++){
                    this.options.data.colors[i] = this.colorPalette[i];
                }

            const randomized_class = `__graphfunnel_${(Math.random()*1000000).toFixed(0)}`;
            chartElement.classList.add(randomized_class);
            this.options.container = `.${randomized_class}`;

            if(!this.graph){
                this.graph = new FunnelGraph(this.options);
                this.graph.draw();
                this.updateRects(chartElement.parentElement);
            }else{
                this.graph.update(this.options);
            }
        }
    }

    export class Comment implements IChart{
        private cardTemplate(title: string | number, sub: string | number, text: string | number, url: string | number, num: number): HTMLElement{
            const colors = ["#c7ba7c", "#69bba8", "#4198ae", "#af767d"];
            const rank = parseInt(<string>sub);
            const ranking_color = rank < 3 ? "red" : rank == 3 ? "#ffeb3b" : "green";
            const html = `
                <div class="card-body" style="color:#fff; background-color:${colors[num%colors.length]}">
                    <h5 class="card-title">${(<string>title).toUpperCase()}</h5>
                    <h3 class="card-subtitle mb-2 text-muted" style="color:${ranking_color}!important">${sub}/5</h6>
                    <p class="card-text mb-2">${text}</p>
                    <h6>@ ${url}</h6>
                </div>
                `;
            const div = document.createElement("div");
            div.classList.add("card");
            div.innerHTML = html;
            return div;
        }

        applyOptions(options: Options): void {
            return;
        }        
        generateChart(data: ChartDataModel, chartElement: HTMLElement): void {
            chartElement.innerHTML = "";
            if(!chartElement.classList.contains("card-columns"))
                chartElement.classList.add("card-columns");
            data.rows.forEach((l,idx) => {
                chartElement.appendChild(this.cardTemplate(l.data[4], l.data[3], l.data[1], l.data[6], idx));
            })
        }
    }
}