import {
  Component,
  AfterViewInit,
  OnInit,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

type Experience = {
  role: string;
  //ompany: string;
  period: string;
  bullets: string[];
};

type Meteor = {
  top: number;
  right: number;
  delay: number;
  duration: number;
  length: number;
};

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  @ViewChild('progress', { static: true })
  progressRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('card') cardRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('dot') dotRefs!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('meteor') meteorRefs!: QueryList<ElementRef<HTMLSpanElement>>;

  meteors: Meteor[] = [];
  maxBullets = 8;
  expanded = signal<Set<number>>(new Set());

  private isBrowser = false;
  private gsap!: any;
  private ScrollTrigger!: any;

  experiences: Experience[] = [
    {
      role: 'Data Solutions Architect',
      //company: "MediTech",
      period: '03/2021 – Present',
      bullets: [
        'Architected end-to-end multi-cloud data platforms across AWS, Azure, and GCP, processing 10TB+ daily across 15+ domains in regulated healthcare environments.',
        'Engineered HIPAA-compliant pipelines for EHR, claims, and clinical data, ensuring secure PHI ingestion, processing, and governance.',
        'Built low-latency streaming pipelines using Kafka and Spark, processing 5M+ events/hour with sub-minute latency.',
        'Optimized Snowflake data warehouses using CDC pipelines (Snowpipe, Streams, Tasks), reducing annual costs by $1.2M.',
        'Designed real-time data integration pipelines for clinical and financial systems, improving data freshness and decision-making capabilities.',
        'Implemented enterprise-grade data security frameworks (encryption, masking, RBAC/ABAC, audit logging) ensuring HIPAA, GDPR, and CCPA compliance.',
        'Developed FHIR and HL7 aligned data models enabling scalable analytics, reporting, and ML use cases.',
        'Led Data Mesh adoption across multiple domains, reducing data access bottlenecks and improving ownership.',
        'Enabled self-service analytics for 300+ users through scalable semantic and data access layers.',
        'Drove cloud cost optimization strategies, reducing infrastructure spend by over 20% across multi-cloud environments.',
        'Integrated ML and GenAI-driven workflows to enhance data enrichment, fraud detection, and analytics accuracy.',
        'Collaborated with stakeholders to align data architecture with business strategy, driving multi-million dollar operational impact.',
      ],
    },
    {
      role: 'Lead Data Engineer',
      period: '12/2016 – 02/2021',
      bullets: [
        'Designed and implemented hybrid data platforms (cloud + on-prem) processing 10TB+ daily using Spark, Kafka, and Databricks.',
        'Built scalable ETL and ELT pipelines using Delta Lake, Airflow, and Python for high-volume data processing.',
        'Implemented data observability frameworks (Monte Carlo, Great Expectations) reducing data quality issues by 60%.',
        'Modernized streaming architecture using Kafka and Kubernetes, reducing latency from 10 minutes to under 1 minute.',
        'Migrated 250+ legacy ETL workflows into modular dbt and Airflow pipelines, reducing operational overhead by 70%.',
        'Ensured fault-tolerant data ingestion architecture with zero data-loss guarantees.',
        'Automated CI/CD pipelines using Jenkins and GitHub Actions for reliable multi-environment deployments.',
        'Mentored engineering teams and improved deployment success rates from 70% to 98%.',
        'Collaborated with data science teams to productionize ML pipelines and reduce deployment cycles by 50%.',
        'Developed self-service analytics capabilities enabling 100+ users with real-time data access.',
      ],
    },
    {
      role: 'Data Engineer',
      period: '08/2014 – 11/2016',
      bullets: [
        'Managed 80+ enterprise ETL workflows using Informatica, SSIS, and Talend across Oracle, SQL Server, and Snowflake environments.',
        'Designed and maintained reusable schema frameworks supporting 40+ datasets across business units.',
        'Developed monitoring and observability dashboards for 300+ jobs, improving SLA adherence from 85% to 99%.',
        'Optimized SQL and PL/SQL queries on datasets exceeding 500M records, reducing processing time by 40%.',
        'Implemented cost optimization strategies reducing cloud and infrastructure spend by 25%.',
        'Built Power BI and Tableau dashboards for compliance, audit, and executive KPI reporting.',
        'Improved data quality processes and reduced incidents by 60% through validation frameworks.',
        'Enhanced healthcare compliance reporting by automating HIPAA and PHI tracking workflows.',
      ],
    },
    {
      role: 'ETL & Data Warehouse Specialist',
      period: '02/2013 – 07/2014',
      bullets: [
        'Developed large-scale ETL workflows using Informatica and SSIS processing 500M+ records daily across telecom and retail systems.',
        'Designed dimensional data models (Star Schema, Data Vault) for scalable BI and analytics workloads.',
        'Improved query performance by 35% through indexing and data model optimization.',
        'Automated batch processing workflows, reducing manual effort by 70% in telecom billing systems.',
        'Optimized reporting pipelines, reducing runtime from 8 hours to 1 hour for POS analytics.',
        'Implemented data governance and security frameworks ensuring compliance with HIPAA, GDPR, and CCPA.',
        'Standardized healthcare data pipelines using ICD-10, CPT, LOINC, and SNOMED frameworks.',
        'Migrated legacy reporting systems from SSRS to Tableau, increasing adoption by 45%.',
        'Developed KPI dashboards for forecasting and churn analysis to support executive decision-making.',
      ],
    },
  ];
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // generate star field
    this.meteors = Array.from({ length: 24 }).map(() => ({
      top: this.rnd(0, 85),
      right: this.rnd(-10, 80),
      delay: this.rnd(0, 7),
      duration: this.rnd(7.5, 12.5),
      length: this.rnd(70, 140),
    }));
  }

  // --- lifecycle -------------------------------------------------------------

  ngOnInit(): void {
    // One-time normalization: collapse whitespace, strip duplicated A+A sentences, dedupe bullets
    this.experiences = this.experiences.map((xp) => ({
      ...xp,
      bullets: this.normalizeBullets(xp.bullets),
    }));
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;

    const mod = await import('gsap');
    this.gsap = (mod as any).gsap ?? mod;
    this.ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
    this.gsap.registerPlugin(this.ScrollTrigger);

    // Scroll progress along the timeline
    this.gsap.fromTo(
      this.progressRef.nativeElement,
      { height: '0%' },
      {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '#experience',
          start: 'top center+=40',
          end: 'bottom center',
          scrub: true,
        },
      },
    );

    // Card reveal
    this.gsap.from(
      this.cardRefs.map((c) => c.nativeElement),
      {
        opacity: 0,
        y: 24,
        scale: 0.985,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '#experience',
          start: 'top 80%',
          once: true,
        },
      },
    );

    // Pulse dots when each card scrolls in
    this.dotRefs.forEach((d) => {
      this.gsap.fromTo(
        d.nativeElement,
        { scale: 0.7, opacity: 0.5 },
        {
          scale: 1.1,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: d.nativeElement, start: 'top 85%' },
          yoyo: true,
          repeat: 1,
        },
      );
    });

    // Apply CSS variables for meteors
    const refs = this.meteorRefs.toArray();
    this.meteors.forEach((m, i) => {
      const el = refs[i]?.nativeElement;
      if (!el) return;
      el.style.setProperty('--top', `${m.top}%`);
      el.style.setProperty('--right', `${m.right}%`);
      el.style.setProperty('--len', `${m.length}px`);
      el.style.setProperty('--dur', `${m.duration}s`);
      el.style.setProperty('--delay', `${m.delay}s`);
    });
  }

  // --- UI helpers ------------------------------------------------------------

  isExpanded(i: number): boolean {
    return this.expanded().has(i);
  }

  toggle(i: number): void {
    const next = new Set(this.expanded());
    next.has(i) ? next.delete(i) : next.add(i);
    this.expanded.set(next);
  }

  visibleBullets(i: number): string[] {
    const xp = this.experiences[i];
    if (!xp) return [];
    return this.isExpanded(i)
      ? xp.bullets
      : xp.bullets.slice(0, this.maxBullets);
  }

  trackByIndex = (idx: number) => idx;

  // --- data normalization ----------------------------------------------------

  private normalizeBullets(arr: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];

    for (let s of arr) {
      // collapse whitespace
      let t = s.replace(/\s+/g, ' ').trim();

      // if string is exactly A + A (duplicated sentence concatenated)
      const half = Math.floor(t.length / 2);
      if (t.length % 2 === 0 && t.slice(0, half) === t.slice(half)) {
        t = t.slice(0, half).trim();
      }

      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }

  // --- utils ----------------------------------------------------------------

  private rnd(min: number, max: number) {
    return +(Math.random() * (max - min) + min).toFixed(2);
  }
}
