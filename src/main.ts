import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import VueApexCharts from "vue3-apexcharts";

import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeflex/primeflex.min.css";
import { Button, FloatLabel, InputNumber, InputText } from "primevue";
import ProgressBar from "primevue/progressbar";
import Select from "primevue/select";
import Chart from "primevue/chart";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const app = createApp(App);

app.use(VueApexCharts).use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".app-dark",
      cssLayer: false,
    },
  },
});

app.component("Button", Button);
app.component("InputText", InputText);
app.component("InputNumber", InputNumber);
app.component("ProgressBar", ProgressBar);
app.component("Select", Select);
app.component("Chart", Chart);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("FloatLabel", FloatLabel);

app.mount("#app");
