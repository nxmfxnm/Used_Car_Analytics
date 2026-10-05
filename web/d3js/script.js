// ============================================
// GLOBAL VARIABLES
// ============================================

let allData = [];

const tooltip = d3.select("#tooltip");


// ============================================
// FORMAT
// ============================================

const moneyFormat = d3.format(",.0f");
const numberFormat = d3.format(",.0f");


// ============================================
// LOAD CSV
// ============================================

d3.csv(
    "../../cleaned/used_cars_clean.csv",

    function (d) {

        return {

            brand: d.brand
                ? d.brand.trim()
                : "Unknown",

            model: d.model
                ? d.model.trim()
                : "Unknown",

            model_year: +d.model_year,

            milage: +d.milage,

            fuel_type: d.fuel_type
                ? d.fuel_type.trim()
                : "Unknown",

            engine: d.engine
                ? d.engine.trim()
                : "Unknown",

            transmission: d.transmission
                ? d.transmission.trim()
                : "Unknown",

            ext_col: d.ext_col
                ? d.ext_col.trim()
                : "Unknown",

            int_col: d.int_col
                ? d.int_col.trim()
                : "Unknown",

            accident: d.accident
                ? d.accident.trim()
                : "Unknown",

            clean_title: d.clean_title
                ? d.clean_title.trim()
                : "Unknown",

            price: +d.price
        };
    }
)

.then(function (data) {

    allData = data.filter(d =>
        Number.isFinite(d.model_year) &&
        Number.isFinite(d.milage) &&
        Number.isFinite(d.price)
    );

    console.log(
        "จำนวนข้อมูลทั้งหมด:",
        allData.length
    );

    console.log(
        "ตัวอย่างข้อมูล:",
        allData[0]
    );

    createFilters();

    updateDashboard(allData);
})

.catch(function (error) {

    console.error(
        "เกิดข้อผิดพลาดในการอ่าน CSV:",
        error
    );
});


// ============================================
// DETAIL ใต้แต่ละกราฟ
// ============================================

function showChartDetail(selector, html) {

    d3.select(selector)
        .html(`
            ${html}

            <button
                class="hide-detail-btn"
                type="button"
            >
                ซ่อนรายละเอียด
            </button>
        `)
        .classed("active", true);


    d3.select(selector)
        .select(".hide-detail-btn")
        .on("click", function () {

            d3.select(selector)
                .classed("active", false);
        });
}


// ============================================
// CREATE FILTER OPTIONS
// ============================================

function createFilters() {

    // ---------------- BRAND ----------------

    const brands = Array.from(
        new Set(
            allData.map(d => d.brand)
        )
    ).sort();


    d3.select("#brandFilter")
        .selectAll("option.brand-option")
        .data(brands)
        .enter()
        .append("option")
        .attr(
            "class",
            "brand-option"
        )
        .attr(
            "value",
            d => d
        )
        .text(
            d => d
        );


    // ---------------- FUEL ----------------

    const fuels = Array.from(
        new Set(
            allData.map(
                d => d.fuel_type
            )
        )
    ).sort();


    d3.select("#fuelFilter")
        .selectAll("option.fuel-option")
        .data(fuels)
        .enter()
        .append("option")
        .attr(
            "class",
            "fuel-option"
        )
        .attr(
            "value",
            d => d
        )
        .text(
            d => d
        );


    // ---------------- ACCIDENT ----------------

    const accidents = Array.from(
        new Set(
            allData.map(
                d => d.accident
            )
        )
    ).sort();


    d3.select("#accidentFilter")
        .selectAll(
            "option.accident-option"
        )
        .data(accidents)
        .enter()
        .append("option")
        .attr(
            "class",
            "accident-option"
        )
        .attr(
            "value",
            d => d
        )
        .text(
            d => d
        );
}


// ============================================
// FILTER EVENTS
// ============================================

d3.select("#brandFilter")
    .on(
        "change",
        applyFilters
    );

d3.select("#fuelFilter")
    .on(
        "change",
        applyFilters
    );

d3.select("#accidentFilter")
    .on(
        "change",
        applyFilters
    );


// ============================================
// RESET FILTER
// ============================================

d3.select("#resetFilter")
    .on("click", function () {

        d3.select("#brandFilter")
            .property(
                "value",
                "All"
            );

        d3.select("#fuelFilter")
            .property(
                "value",
                "All"
            );

        d3.select("#accidentFilter")
            .property(
                "value",
                "All"
            );

        hideAllDetails();

        updateDashboard(allData);
    });


// ============================================
// APPLY FILTERS
// ============================================

function applyFilters() {

    const selectedBrand =
        d3.select("#brandFilter")
            .property("value");

    const selectedFuel =
        d3.select("#fuelFilter")
            .property("value");

    const selectedAccident =
        d3.select("#accidentFilter")
            .property("value");


    const filteredData =
        allData.filter(d => {

            const brandMatch =
                selectedBrand === "All" ||
                d.brand === selectedBrand;

            const fuelMatch =
                selectedFuel === "All" ||
                d.fuel_type === selectedFuel;

            const accidentMatch =
                selectedAccident === "All" ||
                d.accident === selectedAccident;

            return (
                brandMatch &&
                fuelMatch &&
                accidentMatch
            );
        });


    hideAllDetails();

    updateDashboard(filteredData);
}


// ============================================
// HIDE ALL DETAILS
// ============================================

function hideAllDetails() {

    d3.selectAll(".chart-detail")
        .classed("active", false);
}


// ============================================
// UPDATE DASHBOARD
// ============================================

function updateDashboard(data) {

    updateKPI(data);

    drawBrandChart(data);

    drawScatterChart(data);

    drawFuelChart(data);

    drawYearChart(data);

    drawAccidentChart(data);
}


// ============================================
// KPI
// ============================================

function updateKPI(data) {

    const totalCars =
        data.length;

    const averagePrice =
        d3.mean(
            data,
            d => d.price
        ) || 0;

    const averageMileage =
        d3.mean(
            data,
            d => d.milage
        ) || 0;

    const totalBrands =
        new Set(
            data.map(
                d => d.brand
            )
        ).size;


    d3.select("#totalCars")
        .text(
            numberFormat(totalCars)
        );

    d3.select("#averagePrice")
        .text(
            "$" +
            moneyFormat(
                averagePrice
            )
        );

    d3.select("#averageMileage")
        .text(
            numberFormat(
                averageMileage
            )
        );

    d3.select("#totalBrands")
        .text(totalBrands);
}


// ============================================
// TOOLTIP
// ============================================

function showTooltip(event, html) {

    tooltip
        .html(html)
        .style(
            "opacity",
            1
        )
        .style(
            "left",
            event.pageX + 15 + "px"
        )
        .style(
            "top",
            event.pageY - 20 + "px"
        );
}


function moveTooltip(event) {

    tooltip
        .style(
            "left",
            event.pageX + 15 + "px"
        )
        .style(
            "top",
            event.pageY - 20 + "px"
        );
}


function hideTooltip() {

    tooltip
        .style(
            "opacity",
            0
        );
}


// ============================================
// 1. BAR CHART
// Average Price by Brand
// ============================================

function drawBrandChart(data) {

    d3.select("#brandChart")
        .selectAll("*")
        .remove();


    if (data.length === 0) {

        showNoData(
            "#brandChart"
        );

        return;
    }


    const grouped =
        d3.rollups(
            data,

            values =>
                d3.mean(
                    values,
                    d => d.price
                ),

            d => d.brand
        );


    const chartData =
        grouped

            .map(
                ([brand, averagePrice]) => ({
                    brand,
                    averagePrice
                })
            )

            .sort(
                (a, b) =>
                    b.averagePrice -
                    a.averagePrice
            )

            .slice(0, 10);


    const container =
        document.querySelector(
            "#brandChart"
        );


    const width =
        Math.max(
            container.clientWidth,
            700
        );

    const height = 430;

    const margin = {
        top: 20,
        right: 30,
        bottom: 100,
        left: 90
    };


    const svg =
        d3.select("#brandChart")
            .append("svg")
            .attr(
                "viewBox",
                `0 0 ${width} ${height}`
            );


    const x =
        d3.scaleBand()
            .domain(
                chartData.map(
                    d => d.brand
                )
            )
            .range([
                margin.left,
                width - margin.right
            ])
            .padding(0.25);


    const y =
        d3.scaleLinear()
            .domain([
                0,
                d3.max(
                    chartData,
                    d => d.averagePrice
                ) * 1.1
            ])
            .nice()
            .range([
                height - margin.bottom,
                margin.top
            ]);


    // X AXIS

    svg.append("g")
        .attr(
            "class",
            "axis"
        )
        .attr(
            "transform",
            `translate(0,${
                height -
                margin.bottom
            })`
        )
        .call(
            d3.axisBottom(x)
        )
        .selectAll("text")
        .attr(
            "transform",
            "rotate(-40)"
        )
        .style(
            "text-anchor",
            "end"
        );


    // X LABEL

    svg.append("text")
        .attr(
            "class",
            "axis-label"
        )
        .attr(
            "x",
            width / 2
        )
        .attr(
            "y",
            height - 15
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Brand"
        );


    // Y AXIS

    svg.append("g")
        .attr(
            "class",
            "axis"
        )
        .attr(
            "transform",
            `translate(${margin.left},0)`
        )
        .call(
            d3.axisLeft(y)
                .ticks(6)
                .tickFormat(
                    d =>
                        "$" +
                        d3.format("~s")(d)
                )
        );


    // Y LABEL

    svg.append("text")
        .attr(
            "class",
            "axis-label"
        )
        .attr(
            "transform",
            "rotate(-90)"
        )
        .attr(
            "x",
            -(height / 2)
        )
        .attr(
            "y",
            20
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Average Price (USD)"
        );


    // COLOR

    const brandColor =
        d3.scaleOrdinal()

            .domain(
                chartData.map(
                    d => d.brand
                )
            )

            .range([
                "#E11A45",
                "#E3AFC9",
                "#EDC92C",
                "#C98BAD",
                "#F06A89",
                "#D8B24C",
                "#B96B89",
                "#F3C7D8",
                "#D97B4A",
                "#BFA84A"
            ]);


    // BARS

    const bars =
        svg.selectAll(".bar")

            .data(chartData)

            .enter()

            .append("rect")

            .attr(
                "class",
                "bar"
            )

            .attr(
                "x",
                d => x(d.brand)
            )

            .attr(
                "width",
                x.bandwidth()
            )

            .attr(
                "rx",
                4
            )

            .attr(
                "fill",
                d =>
                    brandColor(
                        d.brand
                    )
            )

            // Start Animation

            .attr(
                "y",
                y(0)
            )

            .attr(
                "height",
                0
            );


    // BAR ANIMATION

    bars
        .transition()
        .duration(800)
        .ease(
            d3.easeCubicOut
        )
        .attr(
            "y",
            d =>
                y(
                    d.averagePrice
                )
        )
        .attr(
            "height",
            d =>
                y(0) -
                y(
                    d.averagePrice
                )
        );


    // INTERACTION

    bars

        .on(
            "mouseover",
            function (
                event,
                d
            ) {

                d3.select(this)
                    .style(
                        "opacity",
                        0.75
                    );

                showTooltip(
                    event,
                    `
                    <strong>
                        ${d.brand}
                    </strong>
                    <br>
                    ราคาเฉลี่ย:
                    $${moneyFormat(
                        d.averagePrice
                    )}
                    <br>
                    คลิกเพื่อดูรายละเอียด
                    `
                );
            }
        )

        .on(
            "mousemove",
            moveTooltip
        )

        .on(
            "mouseout",
            function () {

                d3.select(this)
                    .style(
                        "opacity",
                        1
                    );

                hideTooltip();
            }
        )

        .on(
            "click",
            function (
                event,
                d
            ) {

                const brandCars =
                    data.filter(
                        car =>
                            car.brand ===
                            d.brand
                    );

                const avgMileage =
                    d3.mean(
                        brandCars,
                        car =>
                            car.milage
                    ) || 0;

                const newestYear =
                    d3.max(
                        brandCars,
                        car =>
                            car.model_year
                    );

                const oldestYear =
                    d3.min(
                        brandCars,
                        car =>
                            car.model_year
                    );

                const maxPrice =
                    d3.max(
                        brandCars,
                        car =>
                            car.price
                    );

                const minPrice =
                    d3.min(
                        brandCars,
                        car =>
                            car.price
                    );


                showChartDetail(
                    "#brandDetail",
                    `
                    <h3>
                        ${d.brand}
                    </h3>

                    <p>
                        <strong>
                            จำนวนรถ:
                        </strong>
                        ${numberFormat(
                            brandCars.length
                        )} คัน
                    </p>

                    <p>
                        <strong>
                            ราคาเฉลี่ย:
                        </strong>
                        $${moneyFormat(
                            d.averagePrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาต่ำสุด:
                        </strong>
                        $${moneyFormat(
                            minPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาสูงสุด:
                        </strong>
                        $${moneyFormat(
                            maxPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            Mileage เฉลี่ย:
                        </strong>
                        ${numberFormat(
                            avgMileage
                        )} ไมล์
                    </p>

                    <p>
                        <strong>
                            ช่วงปีรถ:
                        </strong>
                        ${oldestYear}
                        -
                        ${newestYear}
                    </p>
                    `
                );
            }
        );
}


// ============================================
// 2. SCATTER PLOT
// Mileage vs Price
// ============================================

function drawScatterChart(data) {

    d3.select("#scatterChart")
        .selectAll("*")
        .remove();


    if (data.length === 0) {

        showNoData(
            "#scatterChart"
        );

        return;
    }


    const container =
        document.querySelector(
            "#scatterChart"
        );

    const width =
        Math.max(
            container.clientWidth,
            520
        );

    const height = 430;

    const margin = {
        top: 20,
        right: 25,
        bottom: 60,
        left: 80
    };


    const svg =
        d3.select(
            "#scatterChart"
        )
        .append("svg")
        .attr(
            "viewBox",
            `0 0 ${width} ${height}`
        );


    const x =
        d3.scaleLinear()
            .domain([
                0,
                d3.max(
                    data,
                    d => d.milage
                ) * 1.05
            ])
            .nice()
            .range([
                margin.left,
                width - margin.right
            ]);


    const y =
        d3.scaleLinear()
            .domain([
                0,
                d3.max(
                    data,
                    d => d.price
                ) * 1.05
            ])
            .nice()
            .range([
                height - margin.bottom,
                margin.top
            ]);


    // X AXIS

    svg.append("g")
        .attr(
            "class",
            "axis"
        )
        .attr(
            "transform",
            `translate(
                0,
                ${
                    height -
                    margin.bottom
                }
            )`
        )
        .call(
            d3.axisBottom(x)
                .ticks(6)
                .tickFormat(
                    d3.format("~s")
                )
        );


    // Y AXIS

    svg.append("g")
        .attr(
            "class",
            "axis"
        )
        .attr(
            "transform",
            `translate(
                ${margin.left},
                0
            )`
        )
        .call(
            d3.axisLeft(y)
                .ticks(6)
                .tickFormat(
                    d =>
                        "$" +
                        d3.format("~s")(d)
                )
        );


    // X LABEL

    svg.append("text")
        .attr(
            "class",
            "axis-label"
        )
        .attr(
            "x",
            width / 2
        )
        .attr(
            "y",
            height - 12
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Mileage (Miles)"
        );


    // Y LABEL

    svg.append("text")
        .attr(
            "class",
            "axis-label"
        )
        .attr(
            "transform",
            "rotate(-90)"
        )
        .attr(
            "x",
            -(height / 2)
        )
        .attr(
            "y",
            18
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Price (USD)"
        );


    // POINTS

    const points =
        svg.selectAll(".point")

            .data(data)

            .enter()

            .append("circle")

            .attr(
                "class",
                "point"
            )

            .attr(
                "cx",
                d => x(d.milage)
            )

            .attr(
                "cy",
                d => y(d.price)
            )

            .attr(
                "r",
                0
            )

            .style(
                "opacity",
                0
            );


    // POINT ANIMATION

    points
        .transition()
        .duration(700)

        .delay(
            (d, i) =>
                Math.min(
                    i * 2,
                    500
                )
        )

        .attr(
            "r",
            3.5
        )

        .style(
            "opacity",
            0.6
        );


    // INTERACTION

    points

        .on(
            "mouseover",
            function (
                event,
                d
            ) {

                d3.select(this)

                    .attr(
                        "r",
                        7
                    )

                    .style(
                        "opacity",
                        1
                    );


                showTooltip(
                    event,
                    `
                    <strong>
                        ${d.brand}
                        ${d.model}
                    </strong>
                    <br>

                    ปีรถ:
                    ${d.model_year}
                    <br>

                    Mileage:
                    ${numberFormat(
                        d.milage
                    )} mi.
                    <br>

                    ราคา:
                    $${moneyFormat(
                        d.price
                    )}
                    <br>

                    เชื้อเพลิง:
                    ${d.fuel_type}
                    <br>

                    คลิกเพื่อดูรายละเอียด
                    `
                );
            }
        )

        .on(
            "mousemove",
            moveTooltip
        )

        .on(
            "mouseout",
            function () {

                d3.select(this)
                    .attr(
                        "r",
                        3.5
                    )
                    .style(
                        "opacity",
                        0.6
                    );

                hideTooltip();
            }
        )

        .on(
            "click",
            function (
                event,
                d
            ) {

                showChartDetail(
                    "#scatterDetail",
                    `
                    <h3>
                        ${d.brand}
                        ${d.model}
                    </h3>

                    <p>
                        <strong>
                            ยี่ห้อ:
                        </strong>
                        ${d.brand}
                    </p>

                    <p>
                        <strong>
                            รุ่น:
                        </strong>
                        ${d.model}
                    </p>

                    <p>
                        <strong>
                            ปีรถ:
                        </strong>
                        ${d.model_year}
                    </p>

                    <p>
                        <strong>
                            ราคา:
                        </strong>
                        $${moneyFormat(
                            d.price
                        )}
                    </p>

                    <p>
                        <strong>
                            Mileage:
                        </strong>
                        ${numberFormat(
                            d.milage
                        )} ไมล์
                    </p>

                    <p>
                        <strong>
                            เชื้อเพลิง:
                        </strong>
                        ${d.fuel_type}
                    </p>

                    <p>
                        <strong>
                            เครื่องยนต์:
                        </strong>
                        ${d.engine}
                    </p>

                    <p>
                        <strong>
                            ระบบเกียร์:
                        </strong>
                        ${d.transmission}
                    </p>

                    <p>
                        <strong>
                            สีภายนอก:
                        </strong>
                        ${d.ext_col}
                    </p>

                    <p>
                        <strong>
                            สีภายใน:
                        </strong>
                        ${d.int_col}
                    </p>

                    <p>
                        <strong>
                            ประวัติอุบัติเหตุ:
                        </strong>
                        ${d.accident}
                    </p>

                    <p>
                        <strong>
                            Clean Title:
                        </strong>
                        ${d.clean_title}
                    </p>
                    `
                );
            }
        );
}


// ============================================
// 3. DONUT CHART
// Fuel Type Distribution
// ============================================

function drawFuelChart(data) {

    d3.select("#fuelChart")
        .selectAll("*")
        .remove();


    if (data.length === 0) {

        showNoData(
            "#fuelChart"
        );

        return;
    }


    const grouped =
        d3.rollups(
            data,

            values =>
                values.length,

            d =>
                d.fuel_type
        )

        .map(
            ([fuel, count]) => ({
                fuel,
                count
            })
        )

        .sort(
            (a, b) =>
                b.count -
                a.count
        );


    const container =
        document.querySelector(
            "#fuelChart"
        );

    const width =
        Math.max(
            container.clientWidth,
            500
        );

    const height = 430;

    const radius =
        Math.min(
            width,
            height
        ) / 2 - 70;


    const svg =
        d3.select("#fuelChart")
            .append("svg")
            .attr(
                "viewBox",
                `0 0 ${width} ${height}`
            );


    const g =
        svg.append("g")
            .attr(
                "transform",
                `translate(
                    ${width / 2},
                    ${height / 2}
                )`
            );


    const color =
        d3.scaleOrdinal()

            .domain(
                grouped.map(
                    d => d.fuel
                )
            )

            .range([
                "#E11A45",
                "#E3AFC9",
                "#EDC92C",
                "#C98BAD",
                "#F06A89",
                "#D8B24C",
                "#B96B89"
            ]);


    const pie =
        d3.pie()
            .sort(null)
            .value(
                d => d.count
            );


    const arc =
        d3.arc()
            .innerRadius(
                radius * 0.55
            )
            .outerRadius(
                radius
            );


    const total =
        d3.sum(
            grouped,
            d => d.count
        );


    // DONUT SLICES

    const slices =
        g.selectAll(".fuel-slice")

            .data(
                pie(grouped)
            )

            .enter()

            .append("path")

            .attr(
                "class",
                "fuel-slice"
            )

            .attr(
                "fill",
                d =>
                    color(
                        d.data.fuel
                    )
            )

            .attr(
                "stroke",
                "white"
            )

            .attr(
                "stroke-width",
                2
            )

            .style(
                "cursor",
                "pointer"
            );


    // DONUT ANIMATION

    slices
        .transition()
        .duration(900)

        .attrTween(
            "d",
            function (d) {

                const interpolate =
                    d3.interpolate(
                        {
                            startAngle: 0,
                            endAngle: 0
                        },
                        d
                    );

                return function (t) {

                    return arc(
                        interpolate(t)
                    );
                };
            }
        );


    // INTERACTION

    slices

        .on(
            "mouseover",
            function (
                event,
                d
            ) {

                d3.select(this)
                    .style(
                        "opacity",
                        0.75
                    );

                const percent =
                    (
                        d.data.count /
                        total *
                        100
                    )
                    .toFixed(1);


                showTooltip(
                    event,
                    `
                    <strong>
                        ${d.data.fuel}
                    </strong>
                    <br>

                    จำนวน:
                    ${numberFormat(
                        d.data.count
                    )} คัน
                    <br>

                    สัดส่วน:
                    ${percent}%
                    <br>

                    คลิกเพื่อดูรายละเอียด
                    `
                );
            }
        )

        .on(
            "mousemove",
            moveTooltip
        )

        .on(
            "mouseout",
            function () {

                d3.select(this)
                    .style(
                        "opacity",
                        1
                    );

                hideTooltip();
            }
        )

        .on(
            "click",
            function (
                event,
                d
            ) {

                const fuelCars =
                    data.filter(
                        car =>
                            car.fuel_type ===
                            d.data.fuel
                    );


                const avgPrice =
                    d3.mean(
                        fuelCars,
                        car =>
                            car.price
                    ) || 0;


                const avgMileage =
                    d3.mean(
                        fuelCars,
                        car =>
                            car.milage
                    ) || 0;


                const minPrice =
                    d3.min(
                        fuelCars,
                        car =>
                            car.price
                    );


                const maxPrice =
                    d3.max(
                        fuelCars,
                        car =>
                            car.price
                    );


                const percentage =
                    (
                        d.data.count /
                        data.length *
                        100
                    )
                    .toFixed(1);


                showChartDetail(
                    "#fuelDetail",
                    `
                    <h3>
                        ${d.data.fuel}
                    </h3>

                    <p>
                        <strong>
                            จำนวนรถ:
                        </strong>
                        ${numberFormat(
                            d.data.count
                        )} คัน
                    </p>

                    <p>
                        <strong>
                            สัดส่วน:
                        </strong>
                        ${percentage}%
                    </p>

                    <p>
                        <strong>
                            ราคาเฉลี่ย:
                        </strong>
                        $${moneyFormat(
                            avgPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาต่ำสุด:
                        </strong>
                        $${moneyFormat(
                            minPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาสูงสุด:
                        </strong>
                        $${moneyFormat(
                            maxPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            Mileage เฉลี่ย:
                        </strong>
                        ${numberFormat(
                            avgMileage
                        )} ไมล์
                    </p>
                    `
                );
            }
        );


    // CENTER NUMBER

    g.append("text")

        .attr(
            "text-anchor",
            "middle"
        )

        .attr(
            "y",
            -5
        )

        .style(
            "font-size",
            "26px"
        )

        .style(
            "font-weight",
            "bold"
        )

        .text(
            numberFormat(total)
        );


    g.append("text")

        .attr(
            "text-anchor",
            "middle"
        )

        .attr(
            "y",
            18
        )

        .style(
            "font-size",
            "12px"
        )

        .style(
            "fill",
            "#78909c"
        )

        .text(
            "รถยนต์"
        );


    // LEGEND

    const legend =
        svg.append("g")

            .attr(
                "class",
                "legend"
            )

            .attr(
                "transform",
                "translate(20,20)"
            );


    const legendItem =
        legend
            .selectAll(
                ".legend-item"
            )

            .data(grouped)

            .enter()

            .append("g")

            .attr(
                "class",
                "legend-item"
            )

            .attr(
                "transform",
                (d, i) =>
                    `translate(
                        0,
                        ${i * 22}
                    )`
            );


    legendItem
        .append("rect")

        .attr(
            "width",
            12
        )

        .attr(
            "height",
            12
        )

        .attr(
            "rx",
            2
        )

        .attr(
            "fill",
            d =>
                color(
                    d.fuel
                )
        );


    legendItem
        .append("text")

        .attr(
            "x",
            18
        )

        .attr(
            "y",
            10
        )

        .text(
            d =>
                `${d.fuel} (${d.count})`
        );
}


// ============================================
// 4. LINE CHART
// Average Price by Model Year
// ============================================

function drawYearChart(data) {

    d3.select("#yearChart")
        .selectAll("*")
        .remove();


    if (data.length === 0) {

        showNoData(
            "#yearChart"
        );

        return;
    }


    const chartData =
        d3.rollups(

            data,

            values => ({

                averagePrice:
                    d3.mean(
                        values,
                        d => d.price
                    ),

                count:
                    values.length
            }),

            d =>
                d.model_year
        )

        .map(
            ([year, values]) => ({

                year:
                    +year,

                averagePrice:
                    values.averagePrice,

                count:
                    values.count
            })
        )

        .sort(
            (a, b) =>
                a.year -
                b.year
        );


    const container =
        document.querySelector(
            "#yearChart"
        );

    const width =
        Math.max(
            container.clientWidth,
            700
        );

    const height = 430;

    const margin = {
        top: 20,
        right: 30,
        bottom: 60,
        left: 90
    };


    const svg =
        d3.select("#yearChart")

            .append("svg")

            .attr(
                "viewBox",
                `0 0 ${width} ${height}`
            );


    const x =
        d3.scaleLinear()

            .domain(
                d3.extent(
                    chartData,
                    d => d.year
                )
            )

            .range([
                margin.left,
                width - margin.right
            ]);


    const y =
        d3.scaleLinear()

            .domain([
                0,

                d3.max(
                    chartData,
                    d =>
                        d.averagePrice
                ) * 1.1
            ])

            .nice()

            .range([
                height -
                margin.bottom,

                margin.top
            ]);


    // X AXIS

    svg.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",
            `translate(
                0,
                ${
                    height -
                    margin.bottom
                }
            )`
        )

        .call(
            d3.axisBottom(x)
                .ticks(10)
                .tickFormat(
                    d3.format("d")
                )
        );


    // Y AXIS

    svg.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",
            `translate(
                ${margin.left},
                0
            )`
        )

        .call(
            d3.axisLeft(y)
                .ticks(6)
                .tickFormat(
                    d =>
                        "$" +
                        d3.format(
                            "~s"
                        )(d)
                )
        );


    // X LABEL

    svg.append("text")

        .attr(
            "class",
            "axis-label"
        )

        .attr(
            "x",
            width / 2
        )

        .attr(
            "y",
            height - 12
        )

        .attr(
            "text-anchor",
            "middle"
        )

        .text(
            "Model Year"
        );


    // Y LABEL

    svg.append("text")

        .attr(
            "class",
            "axis-label"
        )

        .attr(
            "transform",
            "rotate(-90)"
        )

        .attr(
            "x",
            -(height / 2)
        )

        .attr(
            "y",
            18
        )

        .attr(
            "text-anchor",
            "middle"
        )

        .text(
            "Average Price (USD)"
        );


    const line =
        d3.line()

            .x(
                d =>
                    x(d.year)
            )

            .y(
                d =>
                    y(
                        d.averagePrice
                    )
            )

            .curve(
                d3.curveMonotoneX
            );


    // LINE

    const path =
        svg.append("path")

            .datum(chartData)

            .attr(
                "class",
                "line"
            )

            .attr(
                "d",
                line
            )

            .attr(
                "fill",
                "none"
            )

            .attr(
                "stroke",
                "#E11A45"
            )

            .attr(
                "stroke-width",
                3
            );


    // LINE ANIMATION

    const totalLength =
        path.node()
            .getTotalLength();


    path
        .attr(
            "stroke-dasharray",
            `${totalLength} ${totalLength}`
        )

        .attr(
            "stroke-dashoffset",
            totalLength
        )

        .transition()

        .duration(1200)

        .ease(
            d3.easeLinear
        )

        .attr(
            "stroke-dashoffset",
            0
        );


    // POINTS

    const linePoints =
        svg.selectAll(
            ".line-point"
        )

        .data(chartData)

        .enter()

        .append("circle")

        .attr(
            "class",
            "line-point"
        )

        .attr(
            "cx",
            d =>
                x(d.year)
        )

        .attr(
            "cy",
            d =>
                y(
                    d.averagePrice
                )
        )

        .attr(
            "r",
            0
        );


    // POINT ANIMATION

    linePoints
        .transition()

        .duration(400)

        .delay(
            (d, i) =>
                700 +
                i * 20
        )

        .attr(
            "r",
            4
        );


    // INTERACTION

    linePoints

        .on(
            "mouseover",
            function (
                event,
                d
            ) {

                d3.select(this)
                    .attr(
                        "r",
                        7
                    );


                showTooltip(
                    event,
                    `
                    <strong>
                        ปี ${d.year}
                    </strong>
                    <br>

                    ราคาเฉลี่ย:
                    $${moneyFormat(
                        d.averagePrice
                    )}
                    <br>

                    จำนวนรถ:
                    ${numberFormat(
                        d.count
                    )} คัน
                    <br>

                    คลิกเพื่อดูรายละเอียด
                    `
                );
            }
        )

        .on(
            "mousemove",
            moveTooltip
        )

        .on(
            "mouseout",
            function () {

                d3.select(this)
                    .attr(
                        "r",
                        4
                    );

                hideTooltip();
            }
        )

        .on(
            "click",
            function (
                event,
                d
            ) {

                const yearCars =
                    data.filter(
                        car =>
                            car.model_year ===
                            d.year
                    );


                const avgMileage =
                    d3.mean(
                        yearCars,
                        car =>
                            car.milage
                    ) || 0;


                const minPrice =
                    d3.min(
                        yearCars,
                        car =>
                            car.price
                    );


                const maxPrice =
                    d3.max(
                        yearCars,
                        car =>
                            car.price
                    );


                const brands =
                    new Set(
                        yearCars.map(
                            car =>
                                car.brand
                        )
                    ).size;


                showChartDetail(
                    "#yearDetail",
                    `
                    <h3>
                        Model Year
                        ${d.year}
                    </h3>

                    <p>
                        <strong>
                            จำนวนรถ:
                        </strong>
                        ${numberFormat(
                            d.count
                        )} คัน
                    </p>

                    <p>
                        <strong>
                            จำนวนยี่ห้อ:
                        </strong>
                        ${numberFormat(
                            brands
                        )} ยี่ห้อ
                    </p>

                    <p>
                        <strong>
                            ราคาเฉลี่ย:
                        </strong>
                        $${moneyFormat(
                            d.averagePrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาต่ำสุด:
                        </strong>
                        $${moneyFormat(
                            minPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาสูงสุด:
                        </strong>
                        $${moneyFormat(
                            maxPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            Mileage เฉลี่ย:
                        </strong>
                        ${numberFormat(
                            avgMileage
                        )} ไมล์
                    </p>
                    `
                );
            }
        );
}


// ============================================
// 5. BAR CHART
// Average Price by Accident
// ============================================

function drawAccidentChart(data) {

    d3.select(
        "#accidentChart"
    )
    .selectAll("*")
    .remove();


    if (
        data.length === 0
    ) {

        showNoData(
            "#accidentChart"
        );

        return;
    }


    const chartData =
        d3.rollups(

            data,

            values =>
                d3.mean(
                    values,
                    d => d.price
                ),

            d =>
                d.accident
        )

        .map(
            (
                [
                    accident,
                    averagePrice
                ]
            ) => ({

                accident,
                averagePrice
            })
        )

        .sort(
            (a, b) =>
                b.averagePrice -
                a.averagePrice
        );


    const container =
        document.querySelector(
            "#accidentChart"
        );

    const width =
        Math.max(
            container.clientWidth,
            700
        );

    const height = 430;

    const margin = {
        top: 30,
        right: 30,
        bottom: 120,
        left: 100
    };


    const svg =
        d3.select(
            "#accidentChart"
        )

        .append("svg")

        .attr(
            "viewBox",
            `0 0 ${width} ${height}`
        );


    const x =
        d3.scaleBand()

            .domain(
                chartData.map(
                    d =>
                        d.accident
                )
            )

            .range([
                margin.left,
                width -
                margin.right
            ])

            .padding(0.35);


    const y =
        d3.scaleLinear()

            .domain([
                0,

                d3.max(
                    chartData,
                    d =>
                        d.averagePrice
                ) * 1.1
            ])

            .nice()

            .range([
                height -
                margin.bottom,

                margin.top
            ]);


    // X AXIS

    svg.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",
            `translate(
                0,
                ${
                    height -
                    margin.bottom
                }
            )`
        )

        .call(
            d3.axisBottom(x)
        )

        .selectAll("text")

        .attr(
            "transform",
            "rotate(-20)"
        )

        .style(
            "text-anchor",
            "end"
        );


    // Y AXIS

    svg.append("g")

        .attr(
            "class",
            "axis"
        )

        .attr(
            "transform",
            `translate(
                ${margin.left},
                0
            )`
        )

        .call(
            d3.axisLeft(y)

                .ticks(6)

                .tickFormat(
                    d =>
                        "$" +
                        d3.format(
                            "~s"
                        )(d)
                )
        );


    // X LABEL

    svg.append("text")

        .attr(
            "class",
            "axis-label"
        )

        .attr(
            "x",
            width / 2
        )

        .attr(
            "y",
            height - 15
        )

        .attr(
            "text-anchor",
            "middle"
        )

        .text(
            "ประวัติอุบัติเหตุ"
        );


    // Y LABEL

    svg.append("text")

        .attr(
            "class",
            "axis-label"
        )

        .attr(
            "transform",
            "rotate(-90)"
        )

        .attr(
            "x",
            -(height / 2)
        )

        .attr(
            "y",
            22
        )

        .attr(
            "text-anchor",
            "middle"
        )

        .text(
            "ราคาเฉลี่ย (USD)"
        );


    // COLORS

    const accidentColor =
        d3.scaleOrdinal()

            .domain(
                chartData.map(
                    d =>
                        d.accident
                )
            )

            .range([
                "#E11A45",
                "#EDC92C",
                "#E3AFC9",
                "#C98BAD"
            ]);


    // BARS

    const accidentBars =
        svg.selectAll(
            ".accident-bar"
        )

        .data(chartData)

        .enter()

        .append("rect")

        .attr(
            "class",
            "accident-bar"
        )

        .attr(
            "x",
            d =>
                x(
                    d.accident
                )
        )

        .attr(
            "width",
            x.bandwidth()
        )

        .attr(
            "rx",
            6
        )

        .attr(
            "fill",
            d =>
                accidentColor(
                    d.accident
                )
        )

        .attr(
            "y",
            y(0)
        )

        .attr(
            "height",
            0
        );


    // BAR ANIMATION

    accidentBars

        .transition()

        .duration(800)

        .ease(
            d3.easeCubicOut
        )

        .attr(
            "y",
            d =>
                y(
                    d.averagePrice
                )
        )

        .attr(
            "height",
            d =>
                y(0) -
                y(
                    d.averagePrice
                )
        );


    // INTERACTION

    accidentBars

        .on(
            "mouseover",
            function (
                event,
                d
            ) {

                d3.select(this)
                    .style(
                        "opacity",
                        0.75
                    );


                showTooltip(
                    event,
                    `
                    <strong>
                        ${d.accident}
                    </strong>
                    <br>

                    ราคาเฉลี่ย:
                    $${moneyFormat(
                        d.averagePrice
                    )}
                    <br>

                    คลิกเพื่อดูรายละเอียด
                    `
                );
            }
        )

        .on(
            "mousemove",
            moveTooltip
        )

        .on(
            "mouseout",
            function () {

                d3.select(this)
                    .style(
                        "opacity",
                        1
                    );

                hideTooltip();
            }
        )

        .on(
            "click",
            function (
                event,
                d
            ) {

                const accidentCars =
                    data.filter(
                        car =>
                            car.accident ===
                            d.accident
                    );


                const avgMileage =
                    d3.mean(
                        accidentCars,
                        car =>
                            car.milage
                    ) || 0;


                const minPrice =
                    d3.min(
                        accidentCars,
                        car =>
                            car.price
                    );


                const maxPrice =
                    d3.max(
                        accidentCars,
                        car =>
                            car.price
                    );


                const percentage =
                    (
                        accidentCars.length /
                        data.length *
                        100
                    )
                    .toFixed(1);


                showChartDetail(
                    "#accidentDetail",
                    `
                    <h3>
                        ${d.accident}
                    </h3>

                    <p>
                        <strong>
                            จำนวนรถ:
                        </strong>
                        ${numberFormat(
                            accidentCars.length
                        )} คัน
                    </p>

                    <p>
                        <strong>
                            สัดส่วน:
                        </strong>
                        ${percentage}%
                    </p>

                    <p>
                        <strong>
                            ราคาเฉลี่ย:
                        </strong>
                        $${moneyFormat(
                            d.averagePrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาต่ำสุด:
                        </strong>
                        $${moneyFormat(
                            minPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            ราคาสูงสุด:
                        </strong>
                        $${moneyFormat(
                            maxPrice
                        )}
                    </p>

                    <p>
                        <strong>
                            Mileage เฉลี่ย:
                        </strong>
                        ${numberFormat(
                            avgMileage
                        )} ไมล์
                    </p>
                    `
                );
            }
        );
}


// ============================================
// NO DATA
// ============================================

function showNoData(
    selector
) {

    d3.select(selector)

        .append("div")

        .style(
            "height",
            "350px"
        )

        .style(
            "display",
            "flex"
        )

        .style(
            "justify-content",
            "center"
        )

        .style(
            "align-items",
            "center"
        )

        .style(
            "color",
            "#90a4ae"
        )

        .text(
            "ไม่พบข้อมูลตามเงื่อนไขที่เลือก"
        );
}


// ============================================
// RESPONSIVE REDRAW
// ============================================

let resizeTimer;

window.addEventListener(
    "resize",

    function () {

        clearTimeout(
            resizeTimer
        );

        resizeTimer =
            setTimeout(
                function () {

                    applyFilters();
                },

                250
            );
    }
);