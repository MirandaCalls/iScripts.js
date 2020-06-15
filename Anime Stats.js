// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calculator;
class PiChart {
    constructor(data) {
        this.canvas = new DrawContext();
        this.canvas.size = new Size(Device.screenSize().width, 200);
        this.data = data;
        this.used_colors = [];
    }

    randomColor() {
        let colors = [
            Color.blue(),
            Color.brown(),
            Color.cyan(),
            Color.orange(),
            Color.red(),
            Color.yellow(),
            Color.purple(),
            Color.green()
        ];

        let r_color = colors[Math.floor(Math.random()*colors.length)];
        if (this.used_colors.includes(r_color.hex)) {
            return this.randomColor();
        }

        this.used_colors.push(r_color.hex);
        return r_color;
    }

    circleX(angle) {
        return Math.cos(angle) * 95 + 100;
    }
    
    circleY(angle) {
        return Math.sin(angle) * 95 + 100;
    }

    renderImage() {
        let total = 0;
        for (let cat of this.data) {
            total += cat.count;
        }

        let origin = new Point(100, 100);
        let i_radians = 0 - (Math.PI/2);
        this.canvas.setLineWidth(2);
        this.canvas.setStrokeColor(Color.black());
        this.canvas.setFillColor(new Color("#1c1c1e"));
        this.canvas.fill(new Rect(0,0,this.canvas.size.width, this.canvas.size.height));
        for (let cat of this.data) {
            let color = this.randomColor();
            this.canvas.setFillColor(color);
            let perc_decimal = cat.count / total;
            let start_rads = i_radians;
            let stop_rads = i_radians + (perc_decimal*2*Math.PI);
            i_radians = stop_rads;

            let arc = new Path();
            arc.move(origin);
            arc.addLine(new Point(this.circleX(start_rads), this.circleY(start_rads)));
            let step_rads = (stop_rads - start_rads) / 100;
            let rCurr = start_rads;
            while (rCurr <= stop_rads) {
                let px = this.circleX(rCurr);
                let py = this.circleY(rCurr);
                arc.addLine(new Point(px, py));
                rCurr = rCurr + step_rads;
            }
        
            arc.addLine(origin);
            this.canvas.addPath(arc);
            this.canvas.fillPath();
            this.canvas.addPath(arc);
            this.canvas.strokePath();
        }

        return this.canvas.getImage();
    }
}

let test_data = [
    { name: 'Catfish', count: 23 },
    { name: 'Trout', count: 41 },
    { name: 'Goldfish', count: 15 },
    { name: 'Squid', count: 19 }
];

let table = new UITable();
table.showSeparators = true;
let headerRow = new UITableRow();
headerRow.isHeader = true;
(headerRow.addText("Anime Stats")).centerAligned();
table.addRow(headerRow);

let row = new UITableRow();
let chart = new PiChart(test_data);
let img = chart.renderImage();
row.height = img.size.height;
let cell = row.addImage(img);
cell.widthWeight = 100;
table.addRow(row);

let testRow = new UITableRow();
testRow.addText("100 Pointless Numbers");
table.addRow(testRow);

QuickLook.present(table);