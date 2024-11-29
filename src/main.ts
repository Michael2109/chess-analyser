import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts";

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import {Button, InputNumber, InputText} from "primevue";
import ProgressBar from 'primevue/progressbar';
import Select from 'primevue/select';

const app = createApp(App)

app.use(VueApexCharts);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.component('Button', Button);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('ProgressBar', ProgressBar);
app.component('Select', Select);

app.mount('#app')
