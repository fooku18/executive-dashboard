import { AdobeProvider, GscProvider, UsabillaProvider } from "./modules/Provider";
import { Endpoint } from "./enums/Endpoint";
import { Processors } from "./modules/Processors";
import { Charts } from "./modules/Charts";
import { AdobeApiRequest, GscApiRequest, UsabillaApiRequest } from "./types/ApiRequestTypes";
import { RangePicker } from "./modules/RagePicker";
import { IProcessor } from "./interfaces/IProcessor";
import FunnelGraph = require("funnel-graph-js");

declare var window: Window;
declare var document: Document;

;(() => {
    if("serviceWorker" in window.navigator){
        window.navigator.serviceWorker.register(`/sw.js`);
    }
})();

;(() => {
    const rp = new RangePicker(document.querySelector(".calendar"), ".rangepicker-period");
    // process each data-graph tagged wrapper
    document.querySelectorAll<HTMLElement>("[data-draw-graph]").forEach(l => {
        // generate data map
        const dataElements = l.dataset;
        // extract and build all providers
        let providers = Object.keys(dataElements)
            .filter(l => l.match(/^provider/))
            .sort((a, b) => {
                const an = a.split(".")[2];
                const bn = b.split(".")[2];
                if(Number(an) < Number(bn))return -1;
                if(Number(an) > Number(bn))return 1;
                return 0;
            })
            .map(l => {
                const [prefix, providerType, num] = l.split(".");
                // extend switch for new providers if available
                switch(providerType){
                    case "adobe":
                        try{
                            const request: AdobeApiRequest = JSON.parse(dataElements[l]);
                            return new AdobeProvider(Endpoint.adobe, request);
                        }catch(e){}
                    case "gsc":
                        try{
                            const request: GscApiRequest = JSON.parse(dataElements[l]);
                            return new GscProvider(Endpoint.gsc, request);
                        }catch(e){}
                    case "usabilla":
                        try{
                            const request: UsabillaApiRequest = JSON.parse(dataElements[l]);
                            return new UsabillaProvider(Endpoint.usabilla, request);
                        }catch(e){}
                }
            });
        // clean providers list
        providers = providers.filter(l => l);
        // bail out if no providers specified
        if(!providers.length)
            return window.console.warn(`No Providers specified for data wrapper in: <${l.tagName} ${l.classList.value} ${l.tagName}>`);
        
        try{
            if(!dataElements["processor"])
                return window.console.error(`No Processor specified for data wrapper in: <${l.tagName} ${l.classList.value} ${l.tagName}>`);
            const processorName: string = dataElements["processor"];
            const chartModelName: string = dataElements["chart"];
            const processor = <IProcessor>new (Processors)[processorName](l, providers, new(Charts)[chartModelName]())//.build();
            rp.add(picker => {
                processor.update({
                    startDate: picker.state.start,
                    endDate: picker.state.end
                });
            });
        }catch(e){
            console.error(`Graph could not be build\n${e.message}`);
        }
    });
    rp.init();
})();