import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { PlacementService } from '../../service/placement.service';

Chart.register(ChartDataLabels);


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {


  constructor(public placementService: PlacementService) {


    effect(() => {


      const placements = this.placementService.placements();


      this.placementsList = placements;


      this.updateReports(placements);


    });


  }



  // ================= Cards =================


  totalStudentsPlaced = 0;

  totalCompaniesVisited = 0;

  highestPackage = 0;

  averagePackage = 0;



  // ================= Table Data =================


  placementsList:any[] = [];





  // ================= Department Chart =================


  departmentChartData:
  ChartConfiguration<'bar'>['data'] = {


    labels: [],


    datasets:[

      {

        label:'Placed Students',

        data:[],


        backgroundColor:[

          '#4F46E5',
          '#06B6D4',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'

        ],


        borderRadius:8

      }

    ]

  };





  departmentChartOptions:
  ChartConfiguration<'bar'>['options'] = {


    responsive:true,

    maintainAspectRatio:false,


    plugins:{


      legend:{


        display:false


      },


      datalabels:{


        color:'#111',


        anchor:'end',


        align:'top',


        font:{


          weight:'bold'


        },


        formatter:(value:number)=>value


      }


    },



    scales:{


      y:{


        beginAtZero:true,


        ticks:{


          display:false


        },


        grid:{


          display:false


        }


      },


      x:{


        grid:{


          display:false


        }


      }


    }


  };








  // ================= Company Chart =================



  companyChartData:
  ChartConfiguration<'doughnut'>['data'] = {


    labels:[],


    datasets:[


      {


        data:[],


        backgroundColor:[


          '#4F46E5',
          '#06B6D4',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#14B8A6'


        ]


      }


    ]


  };





  companyChartOptions:
  ChartConfiguration<'doughnut'>['options'] = {


    responsive:true,


    maintainAspectRatio:false,



    plugins:{


      legend:{


        position:'right'


      },


      datalabels:{


        color:'#fff',


        font:{


          weight:'bold'


        },


        formatter:(value:number)=>value


      }


    }


  };







  // ================= Update All Reports =================



  updateReports(placements:any[]){



    // Cards


    this.totalStudentsPlaced = placements.length;



    this.totalCompaniesVisited = new Set(

      placements.map(x=>x.companyName)

    ).size;



    this.highestPackage =
    this.placementService.highestPackage();



    this.averagePackage =
    this.placementService.averagePackage();







    // Department Chart



    const deptMap = new Map<string,number>();


    placements.forEach(p=>{


      deptMap.set(

        p.department,

        (deptMap.get(p.department)||0)+1

      );


    });




    this.departmentChartData = {


      labels:Array.from(deptMap.keys()),


      datasets:[


        {


          label:'Placed Students',


          data:Array.from(deptMap.values()),


          backgroundColor:[


            '#4F46E5',
            '#06B6D4',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6'


          ],


          borderRadius:8


        }


      ]


    };









    // Company Chart



    const companyMap = new Map<string,number>();


    placements.forEach(p=>{


      companyMap.set(

        p.companyName,

        (companyMap.get(p.companyName)||0)+1

      );


    });





    this.companyChartData = {



      labels:Array.from(companyMap.keys()),



      datasets:[


        {


          data:Array.from(companyMap.values()),



          backgroundColor:[


            '#4F46E5',
            '#06B6D4',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#EC4899',
            '#14B8A6'


          ]


        }


      ]



    };



  }








  // ================= CSV Export =================



  exportCSV(){



    let csv =

    'Student,Register No,Department,Company,Role,Package\n';



    this.placementsList.forEach(p=>{


      csv +=

      `${p.studentName},${p.registerNumber},${p.department},${p.companyName},${p.jobRole},${p.packageLPA}\n`;


    });




    const blob = new Blob(

      [csv],

      {

        type:'text/csv'

      }

    );



    const url =
    window.URL.createObjectURL(blob);



    const a =
    document.createElement('a');



    a.href=url;


    a.download='placement-report.csv';


    a.click();



    window.URL.revokeObjectURL(url);


  }



}