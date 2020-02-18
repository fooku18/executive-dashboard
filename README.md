# Environment Setup
The API server is running on our remote machine at 46.101.163.138. You need to establish a ssh tunnel in order to request the analytics report API via localhost
1. Create a config to this remote machine in putty
    1. Enter the host 46.101.163.138
    2. Connect the private key "id_rsa.ppk" via "Connect -> SSH -> Auth" and use it as Private key file for authentication
    3. Enter the tunnel config: Source Port 8000, Destination: localhost:8000
    4. Create the connection
    5. Password will be distributed on a different secure way
2. /dist will be the folder which will be later deployed to the remote machine and the django application server. All html files will be available and links between them must be configured in the files. Do not touch static and only use components or create new in/from the /components folder
3. Install all dependencies on your local machine. In order to do so type in: "npm install" in this folder
4. Run the dev server: "npm run dev:server". This will create a local dev server and all changes should be synced directly to your app.

# How to pull data into the components
Each .html page must load the bundle.js from /dist/static/executive. This script on startup will look for HTMLElements tagged with a data-draw-graph attribute. If this HTML attribute is found, the script will initiate a process to provide and apply the options defined on that data wrapper. You can apply the data wrapper as follows:
```html
<!-- This is a chartjs example - canvas is required for chartjs  -->
<div class="chart-wrap"
    data-draw-graph
    data-provider.adobe.1='{"limit":1,"payload":{"rsid":"dhlglobalrolloutprod","globalFilters":[{"type":"dateRange","dateRange":"2019-09-17T00:00:00.000/2019-09-19T00:00:00.000"}],"metricContainer":{"metrics":[{"columnId":"0","id":"metrics/visits","sort":"desc"},{"columnId":"1","id":"metrics/pageviews"}]},"dimension":"variables/page","settings":{"countRepeatInstances":true,"limit":5,"page":0},"statistics":{"functions":["col-max","col-min"]}}}'
    data-processor='AdobeSingle'
    data-chart='Chartjs'
    data-options.chartjs.dataset.1="{'backgroundColor':'#FFCC00', 'borderColor':'#FFFFFF'}"
    data-options.chartjs.dataset.2="{'backgroundColor':'#666666', 'borderColor':'#FFFFFF'}"
    data-options.chartjs.type="bar"
>
    <canvas></canvas>
</div>
```

The following attributes must be provided when applying the data provider:

- __data-provider__ \[required\]
This attribute specifies which provider to use in order to capture the data. Currently available providers are specified in /src/enums/Endpoint.ts. The Endpoint enumaration will be updated with new Providers if implemented. When using this attribute it must adhere to the following convention:
*data-provider.{PROVIDER}.{SEQUENTIAL_NUMBER}*
The sequential number is necessery for the handover of the provided data to the processor. As the actions of the processor will directly use the provided data, the order of the provided data is important for the implementor of new processors.

- __data-processor__ \[required\]
This attribute specifies the processor to use on the provided data. The processors task is to format the data into a 2d-Table like format and to handover this data to a chart model. All available processors are implemented in /src/modules/Processors.ts. New processors must be implemented in this namespace.

- __data-chart__ \[required\]
This attribute specifies a chart model to use. Processors pass 2d-Table like data to this chart model. All chart models are implemented in /src/modules/Charts.ts. New charts must be implemented in this namespace.

- __data-options__
There are plenty of options that can be set for particular chart models. I.e. the user can set specific data-options for the Chartjs chart model. These will be applied on the charts directly. You will find all available options for the particular chart models below.
    - __data-options.chartjs__
        - __data-options.chartjs.dataset.{SEQUENTIAL_NUMBER}__:
            This attribute defines options that are applied directly to the dataset for that graph. Please refer to [this page](https://www.chartjs.org/docs/latest/charts/) in order to see all available options for a particular chart type.
        - __data-options.chartjs.type__:
            This attribute specifies the chart type. Please refere to (this page)[https://www.chartjs.org/docs/latest/charts/] to see all available chart types.
        - __data-options.chartjs.general__:
            This attribute specifies general options for the ChartJs chart.
        
# Chart Model Notes
## SummaryNumber
This chart model has a special behavior when used in a data wrapper element. SummarNumber will use the embedded HTML and replace some special template variables with provided values. The template variables must be emclosed in braces, as: *{TEMPLATE_VARIABLE}*. You can find all available template variables in /src/enums/SummaryNumber.TemplateVariables.ts