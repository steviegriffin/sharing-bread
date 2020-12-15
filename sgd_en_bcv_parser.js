(function () {
  var n,
    B = {}.hasOwnProperty;
  this.bcv_parser = n = (function () {
    function k() {
      var a;
      this.options = {};
      var d = k.prototype.options;
      for (a in d)
        if (B.call(d, a)) {
          var c = d[a];
          this.options[a] = c;
        }
      this.versification_system(this.options.versification_system);
    }
    k.prototype.s = "";
    k.prototype.entities = [];
    k.prototype.passage = null;
    k.prototype.regexps = {};
    k.prototype.options = {
      consecutive_combination_strategy: "combine",
      osis_compaction_strategy: "b",
      book_sequence_strategy: "ignore",
      invalid_sequence_strategy: "ignore",
      sequence_combination_strategy: "combine",
      punctuation_strategy: "us",
      invalid_passage_strategy: "ignore",
      non_latin_digits_strategy: "ignore",
      passage_existence_strategy: "bcv",
      zero_chapter_strategy: "error",
      zero_verse_strategy: "error",
      single_chapter_1_strategy: "chapter",
      book_alone_strategy: "ignore",
      book_range_strategy: "ignore",
      captive_end_digits_strategy: "delete",
      end_range_digits_strategy: "verse",
      include_apocrypha: !1,
      ps151_strategy: "c",
      versification_system: "default",
      case_sensitive: "none"
    };
    k.prototype.parse = function (a) {
      this.reset();
      this.s = a;
      a = this.replace_control_characters(a);
      var d = this.match_books(a);
      a = d[0];
      this.passage.books = d[1];
      this.entities = this.match_passages(a)[0];
      return this;
    };
    k.prototype.parse_with_context = function (a, d) {
      this.reset();
      var c = this.match_books(this.replace_control_characters(d));
      d = c[0];
      this.passage.books = c[1];
      d = this.match_passages(d)[1];
      this.reset();
      this.s = a;
      a = this.replace_control_characters(a);
      c = this.match_books(a);
      a = c[0];
      this.passage.books = c[1];
      this.passage.books.push({
        value: "",
        parsed: [],
        start_index: 0,
        type: "context",
        context: d
      });
      a = "\u001f" + (this.passage.books.length - 1) + "/9\u001f" + a;
      this.entities = this.match_passages(a)[0];
      return this;
    };
    k.prototype.reset = function () {
      this.s = "";
      this.entities = [];
      if (this.passage)
        return (this.passage.books = []), (this.passage.indices = {});
      this.passage = new Ga();
      this.passage.options = this.options;
      return (this.passage.translations = this.translations);
    };
    k.prototype.set_options = function (a) {
      var d;
      for (d in a)
        if (B.call(a, d)) {
          var c = a[d];
          if (
            "include_apocrypha" === d ||
            "versification_system" === d ||
            "case_sensitive" === d
          )
            this[d](c);
          else this.options[d] = c;
        }
      return this;
    };
    k.prototype.include_apocrypha = function (a) {
      var d, c, f;
      if (null == a || (!0 !== a && !1 !== a)) return this;
      this.options.include_apocrypha = a;
      this.regexps.books = this.regexps.get_books(
        a,
        this.options.case_sensitive
      );
      var g = this.translations;
      for (f in g)
        B.call(g, f) &&
          "aliases" !== f &&
          "alternates" !== f &&
          (null == (d = this.translations[f]).chapters && (d.chapters = {}),
          null == (c = this.translations[f].chapters).PSA &&
            (c.PSA = y.shallow_clone_array(
              this.translations["default"].chapters.PSA
            )),
          !0 === a
            ? ((d =
                null != this.translations[f].chapters.PSA151
                  ? this.translations[f].chapters.PSA151[0]
                  : this.translations["default"].chapters.PSA151[0]),
              (this.translations[f].chapters.PSA[150] = d))
            : 151 === this.translations[f].chapters.PSA.length &&
              this.translations[f].chapters.PSA.pop());
      return this;
    };
    k.prototype.versification_system = function (a) {
      var d, c, f;
      if (null == a || null == this.translations[a]) return this;
      if (null != this.translations.alternates["default"])
        if ("default" === a) {
          null != this.translations.alternates["default"].order &&
            (this.translations["default"].order = y.shallow_clone(
              this.translations.alternates["default"].order
            ));
          var g = this.translations.alternates["default"].chapters;
          for (f in g)
            if (B.call(g, f)) {
              var l = g[f];
              this.translations["default"].chapters[f] = y.shallow_clone_array(
                l
              );
            }
        } else this.versification_system("default");
      null == (d = this.translations.alternates)["default"] &&
        (d["default"] = { order: null, chapters: {} });
      "default" !== a &&
        null != this.translations[a].order &&
        (null == (l = this.translations.alternates["default"]).order &&
          (l.order = y.shallow_clone(this.translations["default"].order)),
        (this.translations["default"].order = y.shallow_clone(
          this.translations[a].order
        )));
      if ("default" !== a && null != this.translations[a].chapters)
        for (f in ((d = this.translations[a].chapters), d))
          B.call(d, f) &&
            ((l = d[f]),
            null == (c = this.translations.alternates["default"].chapters)[f] &&
              (c[f] = y.shallow_clone_array(
                this.translations["default"].chapters[f]
              )),
            (this.translations["default"].chapters[f] = y.shallow_clone_array(
              l
            )));
      this.options.versification_system = a;
      this.include_apocrypha(this.options.include_apocrypha);
      return this;
    };
    k.prototype.case_sensitive = function (a) {
      if (
        null == a ||
        ("none" !== a && "books" !== a) ||
        a === this.options.case_sensitive
      )
        return this;
      this.options.case_sensitive = a;
      this.regexps.books = this.regexps.get_books(
        this.options.include_apocrypha,
        a
      );
      return this;
    };
    k.prototype.translation_info = function (a) {
      var d, c;
      null == a && (a = "default");
      null != a &&
        null !=
          (null != (c = this.translations.aliases[a]) ? c.alias : void 0) &&
        (a = this.translations.aliases[a].alias);
      if (null == a || null == this.translations[a]) a = "default";
      c = this.options.versification_system;
      a !== c && this.versification_system(a);
      var f = {
        alias: a,
        books: [],
        chapters: {},
        order: y.shallow_clone(this.translations["default"].order)
      };
      var g = this.translations["default"].chapters;
      for (d in g)
        if (B.call(g, d)) {
          var l = g[d];
          f.chapters[d] = y.shallow_clone_array(l);
        }
      g = f.order;
      for (d in g) B.call(g, d) && ((l = g[d]), (f.books[l - 1] = d));
      a !== c && this.versification_system(c);
      return f;
    };
    k.prototype.replace_control_characters = function (a) {
      a = a.replace(this.regexps.control, " ");
      "replace" === this.options.non_latin_digits_strategy &&
        ((a = a.replace(
          /[\u0660\u06f0\u07c0\u0966\u09e6\u0a66\u0ae6\u0b660\u0c66\u0ce6\u0d66\u0e50\u0ed0\u0f20\u1040\u1090\u17e0\u1810\u1946\u19d0\u1a80\u1a90\u1b50\u1bb0\u1c40\u1c50\ua620\ua8d0\ua900\ua9d0\uaa50\uabf0\uff10]/g,
          "0"
        )),
        (a = a.replace(
          /[\u0661\u06f1\u07c1\u0967\u09e7\u0a67\u0ae7\u0b67\u0be7\u0c67\u0ce7\u0d67\u0e51\u0ed1\u0f21\u1041\u1091\u17e1\u1811\u1947\u19d1\u1a81\u1a91\u1b51\u1bb1\u1c41\u1c51\ua621\ua8d1\ua901\ua9d1\uaa51\uabf1\uff11]/g,
          "1"
        )),
        (a = a.replace(
          /[\u0662\u06f2\u07c2\u0968\u09e8\u0a68\u0ae8\u0b68\u0be8\u0c68\u0ce8\u0d68\u0e52\u0ed2\u0f22\u1042\u1092\u17e2\u1812\u1948\u19d2\u1a82\u1a92\u1b52\u1bb2\u1c42\u1c52\ua622\ua8d2\ua902\ua9d2\uaa52\uabf2\uff12]/g,
          "2"
        )),
        (a = a.replace(
          /[\u0663\u06f3\u07c3\u0969\u09e9\u0a69\u0ae9\u0b69\u0be9\u0c69\u0ce9\u0d69\u0e53\u0ed3\u0f23\u1043\u1093\u17e3\u1813\u1949\u19d3\u1a83\u1a93\u1b53\u1bb3\u1c43\u1c53\ua623\ua8d3\ua903\ua9d3\uaa53\uabf3\uff13]/g,
          "3"
        )),
        (a = a.replace(
          /[\u0664\u06f4\u07c4\u096a\u09ea\u0a6a\u0aea\u0b6a\u0bea\u0c6a\u0cea\u0d6a\u0e54\u0ed4\u0f24\u1044\u1094\u17e4\u1814\u194a\u19d4\u1a84\u1a94\u1b54\u1bb4\u1c44\u1c54\ua624\ua8d4\ua904\ua9d4\uaa54\uabf4\uff14]/g,
          "4"
        )),
        (a = a.replace(
          /[\u0665\u06f5\u07c5\u096b\u09eb\u0a6b\u0aeb\u0b6b\u0beb\u0c6b\u0ceb\u0d6b\u0e55\u0ed5\u0f25\u1045\u1095\u17e5\u1815\u194b\u19d5\u1a85\u1a95\u1b55\u1bb5\u1c45\u1c55\ua625\ua8d5\ua905\ua9d5\uaa55\uabf5\uff15]/g,
          "5"
        )),
        (a = a.replace(
          /[\u0666\u06f6\u07c6\u096c\u09ec\u0a6c\u0aec\u0b6c\u0bec\u0c6c\u0cec\u0d6c\u0e56\u0ed6\u0f26\u1046\u1096\u17e6\u1816\u194c\u19d6\u1a86\u1a96\u1b56\u1bb6\u1c46\u1c56\ua626\ua8d6\ua906\ua9d6\uaa56\uabf6\uff16]/g,
          "6"
        )),
        (a = a.replace(
          /[\u0667\u06f7\u07c7\u096d\u09ed\u0a6d\u0aed\u0b6d\u0bed\u0c6d\u0ced\u0d6d\u0e57\u0ed7\u0f27\u1047\u1097\u17e7\u1817\u194d\u19d7\u1a87\u1a97\u1b57\u1bb7\u1c47\u1c57\ua627\ua8d7\ua907\ua9d7\uaa57\uabf7\uff17]/g,
          "7"
        )),
        (a = a.replace(
          /[\u0668\u06f8\u07c8\u096e\u09ee\u0a6e\u0aee\u0b6e\u0bee\u0c6e\u0cee\u0d6e\u0e58\u0ed8\u0f28\u1048\u1098\u17e8\u1818\u194e\u19d8\u1a88\u1a98\u1b58\u1bb8\u1c48\u1c58\ua628\ua8d8\ua908\ua9d8\uaa58\uabf8\uff18]/g,
          "8"
        )),
        (a = a.replace(
          /[\u0669\u06f9\u07c9\u096f\u09ef\u0a6f\u0aef\u0b6f\u0bef\u0c6f\u0cef\u0d6f\u0e59\u0ed9\u0f29\u1049\u1099\u17e9\u1819\u194f\u19d9\u1a89\u1a99\u1b59\u1bb9\u1c49\u1c59\ua629\ua8d9\ua909\ua9d9\uaa59\uabf9\uff19]/g,
          "9"
        )));
      return a;
    };
    k.prototype.match_books = function (a) {
      var d;
      var c = [];
      var f = this.regexps.books;
      var g = 0;
      for (d = f.length; g < d; g++) {
        var l = f[g];
        var k = !1;
        a = a.replace(l.regexp, function (a, d, f) {
          k = !0;
          c.push({ value: f, parsed: l.osis, type: "book" });
          return (
            d +
            "\u001f" +
            (c.length - 1) +
            (null != l.extra ? "/" + l.extra : "") +
            "\u001f"
          );
        });
        if (!0 === k && /^[\s\x1f\d:.,;\-\u2013\u2014]+$/.test(a)) break;
      }
      a = a.replace(this.regexps.translations, function (a) {
        c.push({ value: a, parsed: a.toLowerCase(), type: "translation" });
        return "\u001e" + (c.length - 1) + "\u001e";
      });
      return [a, this.get_book_indices(c, a)];
    };
    k.prototype.get_book_indices = function (a, d) {
      var c, f;
      var g = 0;
      for (f = /([\x1f\x1e])(\d+)(?:\/\d+)?\1/g; (c = f.exec(d)); )
        (a[c[2]].start_index = c.index + g),
          (g += a[c[2]].value.length - c[0].length);
      return a;
    };
    k.prototype.match_passages = function (a) {
      var d, c;
      var f = [];
      for (c = {}; (d = this.regexps.escaped_passage.exec(a)); ) {
        var g = d[0];
        var l = d[1];
        c = d[2];
        var k = l.length;
        d.index += g.length - k;
        /\s[2-9]\d\d\s*$|\s\d{4,}\s*$/.test(l) &&
          (l = l.replace(/\s+\d+\s*$/, ""));
        /[\d\x1f\x1e)]$/.test(l) || (l = this.replace_match_end(l));
        "delete" === this.options.captive_end_digits_strategy &&
          ((d = d.index + l.length),
          a.length > d &&
            /^\w/.test(a.substr(d, 1)) &&
            (l = l.replace(/[\s*]+\d+$/, "")),
          (l = l.replace(/(\x1e[)\]]?)[\s*]*\d+$/, "$1")));
        l = l.replace(/[A-Z]+/g, function (a) {
          return a.toLowerCase();
        });
        g = "\u001f" === l.substr(0, 1) ? 0 : l.split("\u001f")[0].length;
        d = {
          value: oa.parse(l, {
            punctuation_strategy: this.options.punctuation_strategy
          }),
          type: "base",
          start_index: this.passage.books[c].start_index - g,
          match: l
        };
        "full" === this.options.book_alone_strategy &&
          "include" === this.options.book_range_strategy &&
          "b" === d.value[0].type &&
          (1 === d.value.length ||
            (1 < d.value.length &&
              "translation_sequence" === d.value[1].type)) &&
          0 === g &&
          (1 === this.passage.books[c].parsed.length ||
            (1 < this.passage.books[c].parsed.length &&
              "translation" === this.passage.books[c].parsed[1].type)) &&
          /^[234]/.test(this.passage.books[c].parsed[0]) &&
          this.create_book_range(a, d, c);
        c = this.passage.handle_obj(d);
        d = c[0];
        c = c[1];
        f = f.concat(d);
        k = this.adjust_regexp_end(d, k, l.length);
        0 < k && (this.regexps.escaped_passage.lastIndex -= k);
      }
      return [f, c];
    };
    k.prototype.adjust_regexp_end = function (a, d, c) {
      var f = 0;
      0 < a.length
        ? (f = d - a[a.length - 1].indices[1] - 1)
        : d !== c && (f = d - c);
      return f;
    };
    k.prototype.replace_match_end = function (a) {
      var d, c;
      for (c = a.length; (d = this.regexps.match_end_split.exec(a)); )
        c = d.index + d[0].length;
      c < a.length && (a = a.substr(0, c));
      return a;
    };
    k.prototype.create_book_range = function (a, d, c) {
      var f, g;
      var l = [
        k.prototype.regexps.first,
        k.prototype.regexps.second,
        k.prototype.regexps.third
      ];
      var fa = parseInt(this.passage.books[c].parsed[0].substr(0, 1), 10);
      for (f = g = 1; 1 <= fa ? g < fa : g > fa; f = 1 <= fa ? ++g : --g) {
        var m =
          f === fa - 1
            ? k.prototype.regexps.range_and
            : k.prototype.regexps.range_only;
        m = a.match(
          RegExp(
            "(?:^|\\W)(" + l[f - 1] + "\\s*" + m + "\\s*)\\x1f" + c + "\\x1f",
            "i"
          )
        );
        if (null != m) return this.add_book_range_object(d, m, f);
      }
      return !1;
    };
    k.prototype.add_book_range_object = function (a, d, c) {
      var f, g;
      var l = d[1].length;
      a.value[0] = {
        type: "b_range_pre",
        value: [
          {
            type: "b_pre",
            value: c.toString(),
            indices: [d.index, d.index + l]
          },
          a.value[0]
        ],
        indices: [0, a.value[0].indices[1] + l]
      };
      a.value[0].value[1].indices[0] += l;
      a.value[0].value[1].indices[1] += l;
      a.start_index -= l;
      a.match = d[1] + a.match;
      if (1 !== a.value.length) {
        var k = [];
        d = c = 1;
        for (f = a.value.length; 1 <= f ? c < f : c > f; d = 1 <= f ? ++c : --c)
          null != a.value[d].value &&
            (null != (null != (g = a.value[d].value[0]) ? g.indices : void 0) &&
              ((a.value[d].value[0].indices[0] += l),
              (a.value[d].value[0].indices[1] += l)),
            (a.value[d].indices[0] += l),
            k.push((a.value[d].indices[1] += l)));
        return k;
      }
    };
    k.prototype.osis = function () {
      var a;
      var d = [];
      var c = this.parsed_entities();
      var f = 0;
      for (a = c.length; f < a; f++) {
        var g = c[f];
        0 < g.osis.length && d.push(g.osis);
      }
      return d.join(",");
    };
    k.prototype.osis_and_translations = function () {
      var a;
      var d = [];
      var c = this.parsed_entities();
      var f = 0;
      for (a = c.length; f < a; f++) {
        var g = c[f];
        0 < g.osis.length && d.push([g.osis, g.translations.join(",")]);
      }
      return d;
    };
    k.prototype.osis_and_indices = function () {
      var a;
      var d = [];
      var c = this.parsed_entities();
      var f = 0;
      for (a = c.length; f < a; f++) {
        var g = c[f];
        0 < g.osis.length &&
          d.push({
            osis: g.osis,
            translations: g.translations,
            indices: g.indices
          });
      }
      return d;
    };
    k.prototype.parsed_entities = function () {
      var a, d, c, f, g;
      var l = [];
      var k = (d = 0);
      for (
        c = this.entities.length;
        0 <= c ? d < c : d > c;
        k = 0 <= c ? ++d : --d
      ) {
        var m = this.entities[k];
        m.type &&
          "translation_sequence" === m.type &&
          0 < l.length &&
          k === l[l.length - 1].entity_id + 1 &&
          (l[l.length - 1].indices[1] = m.absolute_indices[1]);
        if (
          null != m.passages &&
          !(
            ("b" === m.type && "ignore" === this.options.book_alone_strategy) ||
            ("b_range" === m.type &&
              "ignore" === this.options.book_range_strategy) ||
            "context" === m.type
          )
        ) {
          var n = [];
          var v = null;
          if (null != m.passages[0].translations) {
            var t = m.passages[0].translations;
            var u = 0;
            for (a = t.length; u < a; u++) {
              var z = t[u];
              var x =
                0 < (null != (f = z.osis) ? f.length : void 0) ? z.osis : "";
              null == v && (v = z.alias);
              n.push(x);
            }
          } else (n = [""]), (v = "default");
          u = [];
          t = m.passages.length;
          a = z = 0;
          for (g = t; 0 <= g ? z < g : z > g; a = 0 <= g ? ++z : --z) {
            x = m.passages[a];
            null == x.type && (x.type = m.type);
            if (
              !1 === x.valid.valid &&
              ("ignore" === this.options.invalid_sequence_strategy &&
                "sequence" === m.type &&
                this.snap_sequence("ignore", m, u, a, t),
              "ignore" === this.options.invalid_passage_strategy)
            )
              continue;
            ("b" !== x.type && "b_range" !== x.type) ||
            "ignore" !== this.options.book_sequence_strategy ||
            "sequence" !== m.type
              ? (("b_range_start" !== x.type && "range_end_b" !== x.type) ||
                  "ignore" !== this.options.book_range_strategy ||
                  this.snap_range(m, a),
                null == x.absolute_indices &&
                  (x.absolute_indices = m.absolute_indices),
                u.push({
                  osis: x.valid.valid ? this.to_osis(x.start, x.end, v) : "",
                  type: x.type,
                  indices: x.absolute_indices,
                  translations: n,
                  start: x.start,
                  end: x.end,
                  enclosed_indices: x.enclosed_absolute_indices,
                  entity_id: k,
                  entities: [x]
                }))
              : this.snap_sequence("book", m, u, a, t);
          }
          if (0 !== u.length)
            if (
              (1 < u.length &&
                "combine" === this.options.consecutive_combination_strategy &&
                (u = this.combine_consecutive_passages(u, v)),
              "separate" === this.options.sequence_combination_strategy)
            )
              l = l.concat(u);
            else {
              v = [];
              a = u.length - 1;
              null != u[a].enclosed_indices &&
                0 <= u[a].enclosed_indices[1] &&
                (m.absolute_indices[1] = u[a].enclosed_indices[1]);
              t = 0;
              for (a = u.length; t < a; t++)
                (z = u[t]), 0 < z.osis.length && v.push(z.osis);
              l.push({
                osis: v.join(","),
                indices: m.absolute_indices,
                translations: n,
                entity_id: k,
                entities: u
              });
            }
        }
      }
      return l;
    };
    k.prototype.to_osis = function (a, d, c) {
      null == d.c &&
        null == d.v &&
        a.b === d.b &&
        null == a.c &&
        null == a.v &&
        "first_chapter" === this.options.book_alone_strategy &&
        (d.c = 1);
      null == a.c && (a.c = 1);
      null == a.v && (a.v = 1);
      null == d.c &&
        (0 <= this.options.passage_existence_strategy.indexOf("c") ||
        (null != this.passage.translations[c].chapters[d.b] &&
          1 === this.passage.translations[c].chapters[d.b].length)
          ? (d.c = this.passage.translations[c].chapters[d.b].length)
          : (d.c = 999));
      null == d.v &&
        (null != this.passage.translations[c].chapters[d.b][d.c - 1] &&
        0 <= this.options.passage_existence_strategy.indexOf("v")
          ? (d.v = this.passage.translations[c].chapters[d.b][d.c - 1])
          : (d.v = 999));
      this.options.include_apocrypha &&
        "b" === this.options.ps151_strategy &&
        ((151 === a.c && "PSA" === a.b) || (151 === d.c && "PSA" === d.b)) &&
        this.fix_ps151(a, d, c);
      if (
        "b" === this.options.osis_compaction_strategy &&
        1 === a.c &&
        1 === a.v &&
        ((999 === d.c && 999 === d.v) ||
          (d.c === this.passage.translations[c].chapters[d.b].length &&
            0 <= this.options.passage_existence_strategy.indexOf("c") &&
            (999 === d.v ||
              (d.v === this.passage.translations[c].chapters[d.b][d.c - 1] &&
                0 <= this.options.passage_existence_strategy.indexOf("v")))))
      ) {
        c = a.b;
        var f = d.b;
      } else
        2 >= this.options.osis_compaction_strategy.length &&
        1 === a.v &&
        (999 === d.v ||
          (d.v === this.passage.translations[c].chapters[d.b][d.c - 1] &&
            0 <= this.options.passage_existence_strategy.indexOf("v")))
          ? ((c = a.b + "." + a.c.toString()), (f = d.b + "." + d.c.toString()))
          : ((c = a.b + "." + a.c.toString() + "." + a.v.toString()),
            (f = d.b + "." + d.c.toString() + "." + d.v.toString()));
      c = c === f ? c : c + "-" + f;
      null != a.extra && (c = a.extra + "," + c);
      null != d.extra && (c += "," + d.extra);
      return c;
    };
    k.prototype.fix_ps151 = function (a, d, c) {
      var f;
      "default" !== c &&
        null ==
          (null != (f = this.translations[c]) ? f.chapters.PSA151 : void 0) &&
        this.passage.promote_book_to_translation("PSA151", c);
      if (151 === a.c && "PSA" === a.b) {
        if (151 === d.c && "PSA" === d.b)
          return (a.b = "PSA151"), (a.c = 1), (d.b = "PSA151"), (d.c = 1);
        a.extra = this.to_osis(
          { b: "PSA151", c: 1, v: a.v },
          {
            b: "PSA151",
            c: 1,
            v: this.passage.translations[c].chapters.PSA151[0]
          },
          c
        );
        a.b = "PRO";
        a.c = 1;
        return (a.v = 1);
      }
      d.extra = this.to_osis(
        { b: "PSA151", c: 1, v: 1 },
        { b: "PSA151", c: 1, v: d.v },
        c
      );
      d.c = 150;
      return (d.v = this.passage.translations[c].chapters.PSA[149]);
    };
    k.prototype.combine_consecutive_passages = function (a, d) {
      var c, f;
      var g = [];
      var l = {};
      var k = a.length - 1;
      var m = -1;
      var n = !1;
      for (c = f = 0; 0 <= k ? f <= k : f >= k; c = 0 <= k ? ++f : --f) {
        var v = a[c];
        if (0 < v.osis.length) {
          var t = g.length - 1;
          var u = !1;
          v.enclosed_indices[0] !== m && (m = v.enclosed_indices[0]);
          0 <= m &&
            (c === k ||
              a[c + 1].enclosed_indices[0] !== v.enclosed_indices[0]) &&
            (n = u = !0);
          this.is_verse_consecutive(l, v.start, d)
            ? ((g[t].end = v.end),
              (g[t].is_enclosed_last = u),
              (g[t].indices[1] = v.indices[1]),
              (g[t].enclosed_indices[1] = v.enclosed_indices[1]),
              (g[t].osis = this.to_osis(g[t].start, v.end, d)))
            : g.push(v);
          l = { b: v.end.b, c: v.end.c, v: v.end.v };
        } else g.push(v), (l = {});
      }
      n && this.snap_enclosed_indices(g);
      return g;
    };
    k.prototype.snap_enclosed_indices = function (a) {
      var d;
      var c = 0;
      for (d = a.length; c < d; c++) {
        var f = a[c];
        null != f.is_enclosed_last &&
          (0 > f.enclosed_indices[0] &&
            f.is_enclosed_last &&
            (f.indices[1] = f.enclosed_indices[1]),
          delete f.is_enclosed_last);
      }
      return a;
    };
    k.prototype.is_verse_consecutive = function (a, d, c) {
      if (null == a.b) return !1;
      var f =
        null != this.passage.translations[c].order
          ? this.passage.translations[c].order
          : this.passage.translations["default"].order;
      if (a.b === d.b)
        if (a.c === d.c) {
          if (a.v === d.v - 1) return !0;
        } else {
          if (
            1 === d.v &&
            a.c === d.c - 1 &&
            a.v === this.passage.translations[c].chapters[a.b][a.c - 1]
          )
            return !0;
        }
      else if (
        1 === d.c &&
        1 === d.v &&
        f[a.b] === f[d.b] - 1 &&
        a.c === this.passage.translations[c].chapters[a.b].length &&
        a.v === this.passage.translations[c].chapters[a.b][a.c - 1]
      )
        return !0;
      return !1;
    };
    k.prototype.snap_range = function (a, d) {
      var c;
      if (
        "b_range_start" === a.type ||
        ("sequence" === a.type && "b_range_start" === a.passages[d].type)
      ) {
        var f = 1;
        var g = "end";
        var l = "b_range_start";
      } else (f = 0), (g = "start"), (l = "range_end_b");
      var k = "end" === g ? "start" : "end";
      var m = a.passages[d][k];
      for (c in m) B.call(m, c) && (a.passages[d][k][c] = a.passages[d][g][c]);
      "sequence" === a.type
        ? (d >= a.value.length && (d = a.value.length - 1),
          (f = this.passage.pluck(l, a.value[d])),
          null != f &&
            ((f = this.snap_range(f, 0)),
            0 === d
              ? (a.absolute_indices[0] = f.absolute_indices[0])
              : (a.absolute_indices[1] = f.absolute_indices[1])))
        : ((a.original_type = a.type),
          (a.type = a.value[f].type),
          (a.absolute_indices = [
            a.value[f].absolute_indices[0],
            a.value[f].absolute_indices[1]
          ]));
      return a;
    };
    k.prototype.snap_sequence = function (a, d, c, f, g) {
      var l = d.passages[f];
      l.absolute_indices[0] === d.absolute_indices[0] &&
      f < g - 1 &&
      this.get_snap_sequence_i(d.passages, f, g) !== f
        ? ((d.absolute_indices[0] = d.passages[f + 1].absolute_indices[0]),
          this.remove_absolute_indices(d.passages, f + 1))
        : l.absolute_indices[1] === d.absolute_indices[1] && 0 < f
        ? (d.absolute_indices[1] =
            0 < c.length
              ? c[c.length - 1].indices[1]
              : d.passages[f - 1].absolute_indices[1])
        : "book" === a &&
          f < g - 1 &&
          !this.starts_with_book(d.passages[f + 1]) &&
          (d.passages[f + 1].absolute_indices[0] = l.absolute_indices[0]);
      return d;
    };
    k.prototype.get_snap_sequence_i = function (a, d, c) {
      var f, g, l;
      for (f = g = l = d + 1; l <= c ? g < c : g > c; f = l <= c ? ++g : --g) {
        if (this.starts_with_book(a[f])) return f;
        if (a[f].valid.valid) break;
      }
      return d;
    };
    k.prototype.starts_with_book = function (a) {
      return "b" === a.type.substr(0, 1) ||
        (("range" === a.type || "ff" === a.type) &&
          "b" === a.start.type.substr(0, 1))
        ? !0
        : !1;
    };
    k.prototype.remove_absolute_indices = function (a, d) {
      var c;
      if (0 > a[d].enclosed_absolute_indices[0]) return !1;
      var f = a[d].enclosed_absolute_indices;
      var g = f[0];
      f = f[1];
      var l = a.slice(d);
      var k = 0;
      for (c = l.length; k < c; k++) {
        var m = l[k];
        if (
          m.enclosed_absolute_indices[0] === g &&
          m.enclosed_absolute_indices[1] === f
        )
          m.enclosed_absolute_indices = [-1, -1];
        else break;
      }
      return !0;
    };
    return k;
  })();
  var Ga = (function () {
    function k() {}
    k.prototype.books = [];
    k.prototype.indices = {};
    k.prototype.options = {};
    k.prototype.translations = {};
    k.prototype.handle_array = function (a, d, c) {
      var f;
      null == d && (d = []);
      null == c && (c = {});
      var g = 0;
      for (f = a.length; g < f; g++) {
        var l = a[g];
        if (null != l) {
          if ("stop" === l.type) break;
          c = this.handle_obj(l, d, c);
          d = c[0];
          c = c[1];
        }
      }
      return [d, c];
    };
    k.prototype.handle_obj = function (a, d, c) {
      return null != a.type && null != this[a.type]
        ? this[a.type](a, d, c)
        : [d, c];
    };
    k.prototype.b = function (a, d, c) {
      var f;
      a.start_context = y.shallow_clone(c);
      a.passages = [];
      c = [];
      var g = this.books[a.value].parsed;
      var l = 0;
      for (f = g.length; l < f; l++) {
        var k = g[l];
        var m = this.validate_ref(a.start_context.translations, { b: k });
        k = { start: { b: k }, end: { b: k }, valid: m };
        0 === a.passages.length && m.valid ? a.passages.push(k) : c.push(k);
      }
      0 === a.passages.length && a.passages.push(c.shift());
      0 < c.length && (a.passages[0].alternates = c);
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      d.push(a);
      c = { b: a.passages[0].start.b };
      null != a.start_context.translations &&
        (c.translations = a.start_context.translations);
      return [d, c];
    };
    k.prototype.b_range = function (a, d, c) {
      return this.range(a, d, c);
    };
    k.prototype.b_range_pre = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      a.passages = [];
      var f = this.pluck("b", a.value);
      c = this.b(f, [], c);
      f = c[0][0];
      c = c[1];
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      var g = {
        b: a.value[0].value + f.passages[0].start.b.substr(1),
        type: "b"
      };
      a.passages = [
        { start: g, end: f.passages[0].end, valid: f.passages[0].valid }
      ];
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      d.push(a);
      return [d, c];
    };
    k.prototype.b_range_start = function (a, d, c) {
      return this.range(a, d, c);
    };
    k.prototype.base = function (a, d, c) {
      this.indices = this.calculate_indices(a.match, a.start_index);
      return this.handle_array(a.value, d, c);
    };
    k.prototype.bc = function (a, d, c) {
      var f;
      a.start_context = y.shallow_clone(c);
      a.passages = [];
      this.reset_context(c, ["b", "c", "v"]);
      var g = this.pluck("c", a.value).value;
      var l = [];
      var k = this.books[this.pluck("b", a.value).value].parsed;
      var m = 0;
      for (f = k.length; m < f; m++) {
        var n = k[m];
        var v = "c";
        var t = this.validate_ref(a.start_context.translations, { b: n, c: g });
        var u = { start: { b: n }, end: { b: n }, valid: t };
        if (
          t.messages.start_chapter_not_exist_in_single_chapter_book ||
          t.messages.start_chapter_1
        )
          (u.valid = this.validate_ref(a.start_context.translations, {
            b: n,
            v: g
          })),
            t.messages.start_chapter_not_exist_in_single_chapter_book &&
              (u.valid.messages.start_chapter_not_exist_in_single_chapter_book = 1),
            (u.start.c = 1),
            (u.end.c = 1),
            (v = "v");
        u.start[v] = g;
        n = this.fix_start_zeroes(u.valid, u.start.c, u.start.v);
        u.start.c = n[0];
        u.start.v = n[1];
        null == u.start.v && delete u.start.v;
        u.end[v] = u.start[v];
        0 === a.passages.length && u.valid.valid
          ? a.passages.push(u)
          : l.push(u);
      }
      0 === a.passages.length && a.passages.push(l.shift());
      0 < l.length && (a.passages[0].alternates = l);
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      this.set_context_from_object(c, ["b", "c", "v"], a.passages[0].start);
      d.push(a);
      return [d, c];
    };
    k.prototype.bc_title = function (a, d, c) {
      var f, g;
      a.start_context = y.shallow_clone(c);
      c = this.bc(this.pluck("bc", a.value), [], c);
      var l = c[0][0];
      c = c[1];
      if (
        "PSA" !== l.passages[0].start.b.substr(0, 2) &&
        null != l.passages[0].alternates
      ) {
        var k = (f = 0);
        for (
          g = l.passages[0].alternates.length;
          0 <= g ? f < g : f > g;
          k = 0 <= g ? ++f : --f
        )
          if ("PSA" === l.passages[0].alternates[k].start.b.substr(0, 2)) {
            l.passages[0] = l.passages[0].alternates[k];
            break;
          }
      }
      if ("PSA" !== l.passages[0].start.b.substr(0, 2))
        return d.push(l), [d, c];
      this.books[this.pluck("b", l.value).value].parsed = ["PSA"];
      l = this.pluck("title", a.value);
      null == l && (l = this.pluck("v", a.value));
      a.value[1] = {
        type: "v",
        value: [{ type: "integer", value: 1, indices: l.indices }],
        indices: l.indices
      };
      a.type = "bcv";
      return this.bcv(a, d, a.start_context);
    };
    k.prototype.bcv = function (a, d, c) {
      var f;
      a.start_context = y.shallow_clone(c);
      a.passages = [];
      this.reset_context(c, ["b", "c", "v"]);
      var g = this.pluck("bc", a.value);
      var l = this.pluck("c", g.value).value;
      var k = this.pluck("v", a.value).value;
      var m = [];
      var n = this.books[this.pluck("b", g.value).value].parsed;
      g = 0;
      for (f = n.length; g < f; g++) {
        var v = n[g];
        var t = this.validate_ref(a.start_context.translations, {
          b: v,
          c: l,
          v: k
        });
        k = this.fix_start_zeroes(t, l, k);
        l = k[0];
        k = k[1];
        v = {
          start: { b: v, c: l, v: k },
          end: { b: v, c: l, v: k },
          valid: t
        };
        0 === a.passages.length && t.valid ? a.passages.push(v) : m.push(v);
      }
      0 === a.passages.length && a.passages.push(m.shift());
      0 < m.length && (a.passages[0].alternates = m);
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      this.set_context_from_object(c, ["b", "c", "v"], a.passages[0].start);
      d.push(a);
      return [d, c];
    };
    k.prototype.bv = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      var f = a.value;
      f = {
        indices: a.indices,
        value: [
          {
            type: "bc",
            value: [f[0], { type: "c", value: [{ type: "integer", value: 1 }] }]
          },
          f[1]
        ]
      };
      c = this.bcv(f, [], c);
      f = c[0][0];
      c = c[1];
      a.passages = f.passages;
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      d.push(a);
      return [d, c];
    };
    k.prototype.c = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      var f =
        "integer" === a.type ? a.value : this.pluck("integer", a.value).value;
      var g = this.validate_ref(a.start_context.translations, { b: c.b, c: f });
      if (!g.valid && g.messages.start_chapter_not_exist_in_single_chapter_book)
        return this.v(a, d, c);
      f = this.fix_start_zeroes(g, f)[0];
      a.passages = [
        { start: { b: c.b, c: f }, end: { b: c.b, c: f }, valid: g }
      ];
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      d.push(a);
      c.c = f;
      this.reset_context(c, ["v"]);
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      return [d, c];
    };
    k.prototype.c_psalm = function (a, d, c) {
      a.type = "bc";
      var f = parseInt(this.books[a.value].value.match(/^\d+/)[0], 10);
      a.value = [
        { type: "b", value: a.value, indices: a.indices },
        {
          type: "c",
          value: [{ type: "integer", value: f, indices: a.indices }],
          indices: a.indices
        }
      ];
      return this.bc(a, d, c);
    };
    k.prototype.c_title = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      if ("PSA" !== c.b) return this.c(a.value[0], d, c);
      c = this.pluck("title", a.value);
      a.value[1] = {
        type: "v",
        value: [{ type: "integer", value: 1, indices: c.indices }],
        indices: c.indices
      };
      a.type = "cv";
      return this.cv(a, d, a.start_context);
    };
    k.prototype.cv = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      var f = this.pluck("c", a.value).value;
      var g = this.pluck("v", a.value).value;
      var l = this.validate_ref(a.start_context.translations, {
        b: c.b,
        c: f,
        v: g
      });
      g = this.fix_start_zeroes(l, f, g);
      f = g[0];
      g = g[1];
      a.passages = [
        { start: { b: c.b, c: f, v: g }, end: { b: c.b, c: f, v: g }, valid: l }
      ];
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      d.push(a);
      c.c = f;
      c.v = g;
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      return [d, c];
    };
    k.prototype.cb_range = function (a, d, c) {
      a.type = "range";
      var f = a.value;
      var g = f[0];
      var l = f[1];
      f = f[2];
      a.value = [{ type: "bc", value: [g, l], indices: a.indices }, f];
      f.indices[1] = a.indices[1];
      return this.range(a, d, c);
    };
    k.prototype.context = function (a, d, c) {
      var f;
      a.start_context = y.shallow_clone(c);
      a.passages = [];
      var g = this.books[a.value].context;
      for (f in g) B.call(g, f) && (c[f] = this.books[a.value].context[f]);
      d.push(a);
      return [d, c];
    };
    k.prototype.cv_psalm = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      a.type = "bcv";
      var f = a.value;
      var g = f[0];
      f = f[1];
      g = this.c_psalm(g, [], a.start_context)[0][0];
      a.value = [g, f];
      return this.bcv(a, d, c);
    };
    k.prototype.ff = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      a.value.push({ type: "integer", indices: a.indices, value: 999 });
      c = this.range(a, [], a.start_context);
      a = c[0][0];
      c = c[1];
      a.value[0].indices = a.value[1].indices;
      a.value[0].absolute_indices = a.value[1].absolute_indices;
      a.value.pop();
      null != a.passages[0].valid.messages.end_verse_not_exist &&
        delete a.passages[0].valid.messages.end_verse_not_exist;
      null != a.passages[0].valid.messages.end_chapter_not_exist &&
        delete a.passages[0].valid.messages.end_chapter_not_exist;
      null != a.passages[0].end.original_c &&
        delete a.passages[0].end.original_c;
      d.push(a);
      return [d, c];
    };
    k.prototype.integer_title = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      if ("PSA" !== c.b) return this.integer(a.value[0], d, c);
      a.value[0] = {
        type: "c",
        value: [a.value[0]],
        indices: [a.value[0].indices[0], a.value[0].indices[1]]
      };
      a.value[1].type = "v";
      a.value[1].original_type = "title";
      a.value[1].value = [
        { type: "integer", value: 1, indices: a.value[1].value.indices }
      ];
      a.type = "cv";
      return this.cv(a, d, a.start_context);
    };
    k.prototype.integer = function (a, d, c) {
      return null != c.v ? this.v(a, d, c) : this.c(a, d, c);
    };
    k.prototype.next_v = function (a, d, c) {
      a.start_context = y.shallow_clone(c);
      var f = this.pluck_last_recursively("integer", a.value);
      null == f && (f = { value: 1 });
      a.value.push({ type: "integer", indices: a.indices, value: f.value + 1 });
      c = this.range(a, [], a.start_context);
      f = c[0][0];
      c = c[1];
      null != f.passages[0].valid.messages.end_verse_not_exist &&
        null == f.passages[0].valid.messages.start_verse_not_exist &&
        null == f.passages[0].valid.messages.start_chapter_not_exist &&
        null != c.c &&
        (a.value.pop(),
        a.value.push({
          type: "cv",
          indices: a.indices,
          value: [
            {
              type: "c",
              value: [{ type: "integer", value: c.c + 1, indices: a.indices }],
              indices: a.indices
            },
            {
              type: "v",
              value: [{ type: "integer", value: 1, indices: a.indices }],
              indices: a.indices
            }
          ]
        }),
        (a = this.range(a, [], a.start_context)),
        (f = a[0]),
        (f = f[0]),
        (c = a[1]));
      f.value[0].indices = f.value[1].indices;
      f.value[0].absolute_indices = f.value[1].absolute_indices;
      f.value.pop();
      null != f.passages[0].valid.messages.end_verse_not_exist &&
        delete f.passages[0].valid.messages.end_verse_not_exist;
      null != f.passages[0].valid.messages.end_chapter_not_exist &&
        delete f.passages[0].valid.messages.end_chapter_not_exist;
      null != f.passages[0].end.original_c &&
        delete f.passages[0].end.original_c;
      d.push(f);
      return [d, c];
    };
    k.prototype.sequence = function (a, d, c) {
      var f, g;
      a.start_context = y.shallow_clone(c);
      a.passages = [];
      var l = a.value;
      var k = 0;
      for (f = l.length; k < f; k++) {
        var m = l[k];
        c = this.handle_array(m, [], c);
        m = c[0];
        m = m[0];
        c = c[1];
        var n = m.passages;
        var v = 0;
        for (g = n.length; v < g; v++) {
          var t = n[v];
          null == t.type && (t.type = m.type);
          null == t.absolute_indices &&
            (t.absolute_indices = m.absolute_indices);
          null != m.start_context.translations &&
            (t.translations = m.start_context.translations);
          t.enclosed_absolute_indices =
            "sequence_post_enclosed" === m.type ? m.absolute_indices : [-1, -1];
          a.passages.push(t);
        }
      }
      null == a.absolute_indices &&
        (a.absolute_indices =
          0 < a.passages.length && "sequence" === a.type
            ? [
                a.passages[0].absolute_indices[0],
                a.passages[a.passages.length - 1].absolute_indices[1]
              ]
            : this.get_absolute_indices(a.indices));
      d.push(a);
      return [d, c];
    };
    k.prototype.sequence_post_enclosed = function (a, d, c) {
      return this.sequence(a, d, c);
    };
    k.prototype.v = function (a, d, c) {
      var f =
        "integer" === a.type ? a.value : this.pluck("integer", a.value).value;
      a.start_context = y.shallow_clone(c);
      var g = null != c.c ? c.c : 1;
      var l = this.validate_ref(a.start_context.translations, {
        b: c.b,
        c: g,
        v: f
      });
      f = this.fix_start_zeroes(l, 0, f)[1];
      a.passages = [
        { start: { b: c.b, c: g, v: f }, end: { b: c.b, c: g, v: f }, valid: l }
      ];
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      d.push(a);
      c.v = f;
      return [d, c];
    };
    k.prototype.range = function (a, d, c) {
      var f, g, l, k;
      a.start_context = y.shallow_clone(c);
      var m = a.value;
      var n = m[0];
      m = m[1];
      c = this.handle_obj(n, [], c);
      n = c[0][0];
      c = c[1];
      if (
        "v" === m.type &&
        (("bc" === n.type &&
          (null == (f = n.passages) ||
            null == (g = f[0]) ||
            null == (l = g.valid) ||
            null == (k = l.messages) ||
            !k.start_chapter_not_exist_in_single_chapter_book)) ||
          "c" === n.type) &&
        "verse" === this.options.end_range_digits_strategy
      )
        return (a.value[0] = n), this.range_change_integer_end(a, d);
      c = this.handle_obj(m, [], c);
      m = c[0][0];
      c = c[1];
      a.value = [n, m];
      a.indices = [n.indices[0], m.indices[1]];
      delete a.absolute_indices;
      g = {
        b: n.passages[0].start.b,
        c: n.passages[0].start.c,
        v: n.passages[0].start.v,
        type: n.type
      };
      f = {
        b: m.passages[0].end.b,
        c: m.passages[0].end.c,
        v: m.passages[0].end.v,
        type: m.type
      };
      m.passages[0].valid.messages.start_chapter_is_zero && (f.c = 0);
      m.passages[0].valid.messages.start_verse_is_zero && (f.v = 0);
      l = this.validate_ref(a.start_context.translations, g, f);
      if (l.valid) {
        if (
          ((m = this.range_handle_valid(l, a, n, g, m, f, d)),
          (n = m[0]),
          (m = m[1]),
          n)
        )
          return m;
      } else return this.range_handle_invalid(l, a, n, g, m, f, d);
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      a.passages = [{ start: g, end: f, valid: l }];
      null != a.start_context.translations &&
        (a.passages[0].translations = a.start_context.translations);
      "b" === g.type
        ? (a.type = "b" === f.type ? "b_range" : "b_range_start")
        : "b" === f.type && (a.type = "range_end_b");
      d.push(a);
      return [d, c];
    };
    k.prototype.range_change_end = function (a, d, c) {
      var f = a.value[1];
      "integer" === f.type
        ? ((f.original_value = f.value), (f.value = c))
        : "v" === f.type
        ? ((f = this.pluck("integer", f.value)),
          (f.original_value = f.value),
          (f.value = c))
        : "cv" === f.type &&
          ((f = this.pluck("c", f.value)),
          (f.original_value = f.value),
          (f.value = c));
      return this.handle_obj(a, d, a.start_context);
    };
    k.prototype.range_change_integer_end = function (a, d) {
      var c = a.value;
      var f = c[0];
      c = c[1];
      null == a.original_type && (a.original_type = a.type);
      null == a.original_value && (a.original_value = [f, c]);
      a.type = "integer" === f.type ? "cv" : f.type + "v";
      "integer" === f.type &&
        (a.value[0] = { type: "c", value: [f], indices: f.indices });
      "integer" === c.type &&
        (a.value[1] = { type: "v", value: [c], indices: c.indices });
      return this.handle_obj(a, d, a.start_context);
    };
    k.prototype.range_check_new_end = function (a, d, c, f) {
      var g = 0;
      var l = null;
      f.messages.end_chapter_before_start
        ? (l = "c")
        : f.messages.end_verse_before_start && (l = "v");
      null != l && (g = this.range_get_new_end_value(d, c, f, l));
      0 < g &&
        ((d = { b: c.b, c: c.c, v: c.v }),
        (d[l] = g),
        (a = this.validate_ref(a, d)),
        a.valid || (g = 0));
      return g;
    };
    k.prototype.range_end_b = function (a, d, c) {
      return this.range(a, d, c);
    };
    k.prototype.range_get_new_end_value = function (a, d, c, f) {
      var g = 0;
      if (
        ("c" === f && c.messages.end_chapter_is_zero) ||
        ("v" === f && c.messages.end_verse_is_zero)
      )
        return g;
      10 <= a[f] && 10 > d[f] && a[f] - 10 * Math.floor(a[f] / 10) < d[f]
        ? (g = d[f] + 10 * Math.floor(a[f] / 10))
        : 100 <= a[f] && 100 > d[f] && a[f] - 100 < d[f] && (g = d[f] + 100);
      return g;
    };
    k.prototype.range_handle_invalid = function (a, d, c, f, g, l, k) {
      if (
        (!1 === a.valid &&
          (a.messages.end_chapter_before_start ||
            a.messages.end_verse_before_start) &&
          ("integer" === g.type || "v" === g.type)) ||
        (!1 === a.valid &&
          a.messages.end_chapter_before_start &&
          "cv" === g.type)
      )
        if (
          ((a = this.range_check_new_end(
            d.start_context.translations,
            f,
            l,
            a
          )),
          0 < a)
        )
          return this.range_change_end(d, k, a);
      if (
        "verse" === this.options.end_range_digits_strategy &&
        null == f.v &&
        ("integer" === g.type || "v" === g.type) &&
        ((a = "v" === g.type ? this.pluck("integer", g.value) : g.value),
        (f = this.validate_ref(d.start_context.translations, {
          b: f.b,
          c: f.c,
          v: a
        })),
        f.valid)
      )
        return this.range_change_integer_end(d, k);
      null == d.original_type && (d.original_type = d.type);
      d.type = "sequence";
      c = [
        [c, g],
        [[c], [g]]
      ];
      d.original_value = c[0];
      d.value = c[1];
      return this.sequence(d, k, d.start_context);
    };
    k.prototype.range_handle_valid = function (a, d, c, f, g, l, k) {
      if (
        a.messages.end_chapter_not_exist &&
        "verse" === this.options.end_range_digits_strategy &&
        null == f.v &&
        ("integer" === g.type || "v" === g.type) &&
        0 <= this.options.passage_existence_strategy.indexOf("v") &&
        ((c = "v" === g.type ? this.pluck("integer", g.value) : g.value),
        (c = this.validate_ref(d.start_context.translations, {
          b: f.b,
          c: f.c,
          v: c
        })),
        c.valid)
      )
        return [!0, this.range_change_integer_end(d, k)];
      this.range_validate(a, f, l, d);
      return [!1, null];
    };
    k.prototype.range_validate = function (a, d, c, f) {
      a.messages.end_chapter_not_exist ||
      a.messages.end_chapter_not_exist_in_single_chapter_book
        ? ((c.original_c = c.c),
          (c.c = a.messages.end_chapter_not_exist
            ? a.messages.end_chapter_not_exist
            : a.messages.end_chapter_not_exist_in_single_chapter_book),
          null != c.v &&
            ((c.v = this.validate_ref(f.start_context.translations, {
              b: c.b,
              c: c.c,
              v: 999
            }).messages.end_verse_not_exist),
            delete a.messages.end_verse_is_zero))
        : a.messages.end_verse_not_exist &&
          ((c.original_v = c.v), (c.v = a.messages.end_verse_not_exist));
      a.messages.end_verse_is_zero &&
        "allow" !== this.options.zero_verse_strategy &&
        (c.v = a.messages.end_verse_is_zero);
      a.messages.end_chapter_is_zero && (c.c = a.messages.end_chapter_is_zero);
      a = this.fix_start_zeroes(a, d.c, d.v);
      d.c = a[0];
      d.v = a[1];
      return !0;
    };
    k.prototype.translation_sequence = function (a, d, c) {
      var f;
      a.start_context = y.shallow_clone(c);
      var g = [];
      g.push({ translation: this.books[a.value[0].value].parsed });
      var l = a.value[1];
      var k = 0;
      for (f = l.length; k < f; k++) {
        var m = l[k];
        m = this.books[this.pluck("translation", m).value].parsed;
        null != m && g.push({ translation: m });
      }
      k = 0;
      for (f = g.length; k < f; k++)
        (l = g[k]),
          null != this.translations.aliases[l.translation]
            ? ((l.alias = this.translations.aliases[l.translation].alias),
              (l.osis =
                this.translations.aliases[l.translation].osis ||
                l.translation.toUpperCase()))
            : ((l.alias = "default"), (l.osis = l.translation.toUpperCase()));
      0 < d.length && (c = this.translation_sequence_apply(d, g));
      null == a.absolute_indices &&
        (a.absolute_indices = this.get_absolute_indices(a.indices));
      d.push(a);
      this.reset_context(c, ["translations"]);
      return [d, c];
    };
    k.prototype.translation_sequence_apply = function (a, d) {
      var c, f, g;
      var l = 0;
      for (
        c = f = g = a.length - 1;
        0 >= g ? 0 >= f : 0 <= f;
        c = 0 >= g ? ++f : --f
      )
        if (
          (null != a[c].original_type && (a[c].type = a[c].original_type),
          null != a[c].original_value && (a[c].value = a[c].original_value),
          "translation_sequence" === a[c].type)
        ) {
          l = c + 1;
          break;
        }
      l < a.length
        ? ((a[l].start_context.translations = d),
          (c = this.handle_array(a.slice(l), [], a[l].start_context)),
          (c = c[1]))
        : (c = y.shallow_clone(a[a.length - 1].start_context));
      return c;
    };
    k.prototype.pluck = function (a, d) {
      var c;
      var f = 0;
      for (c = d.length; f < c; f++) {
        var g = d[f];
        if (null != g && null != g.type && g.type === a)
          return "c" === a || "v" === a ? this.pluck("integer", g.value) : g;
      }
      return null;
    };
    k.prototype.pluck_last_recursively = function (a, d) {
      var c;
      for (c = d.length - 1; 0 <= c; c += -1) {
        var f = d[c];
        if (null != f && null != f.type) {
          if (f.type === a) return this.pluck(a, [f]);
          f = this.pluck_last_recursively(a, f.value);
          if (null != f) return f;
        }
      }
      return null;
    };
    k.prototype.set_context_from_object = function (a, d, c) {
      var f;
      var g = [];
      var l = 0;
      for (f = d.length; l < f; l++) {
        var k = d[l];
        null != c[k] && g.push((a[k] = c[k]));
      }
      return g;
    };
    k.prototype.reset_context = function (a, d) {
      var c;
      var f = [];
      var g = 0;
      for (c = d.length; g < c; g++) {
        var l = d[g];
        f.push(delete a[l]);
      }
      return f;
    };
    k.prototype.fix_start_zeroes = function (a, d, c) {
      a.messages.start_chapter_is_zero &&
        "upgrade" === this.options.zero_chapter_strategy &&
        (d = a.messages.start_chapter_is_zero);
      a.messages.start_verse_is_zero &&
        "upgrade" === this.options.zero_verse_strategy &&
        (c = a.messages.start_verse_is_zero);
      return [d, c];
    };
    k.prototype.calculate_indices = function (a, d) {
      var c, f;
      var g = "book";
      var l = [];
      var k = 0;
      d = parseInt(d, 10);
      var m = [a];
      var n = ["\u001e", "\u001f"];
      var v = 0;
      for (c = n.length; v < c; v++) {
        var t = n[v];
        var u = [];
        var z = 0;
        for (f = m.length; z < f; z++) {
          var x = m[z];
          u = u.concat(x.split(t));
        }
        m = u;
      }
      z = 0;
      for (v = m.length; z < v; z++)
        (x = m[z]),
          (g = "book" === g ? "rest" : "book"),
          (c = x.length),
          0 !== c &&
            ("book" === g
              ? ((x = x.replace(/\/\d+$/, "")),
                (t = k + c),
                0 < l.length && l[l.length - 1].index === d
                  ? (l[l.length - 1].end = t)
                  : l.push({ start: k, end: t, index: d }),
                (k += c + 2),
                (d =
                  this.books[x].start_index + this.books[x].value.length - k),
                l.push({ start: t + 1, end: t + 1, index: d }))
              : ((t = k + c - 1),
                0 < l.length && l[l.length - 1].index === d
                  ? (l[l.length - 1].end = t)
                  : l.push({ start: k, end: t, index: d }),
                (k += c)));
      return l;
    };
    k.prototype.get_absolute_indices = function (a) {
      var d, c;
      var f = a[0];
      a = a[1];
      var g = (c = null);
      var l = this.indices;
      var k = 0;
      for (d = l.length; k < d; k++) {
        var m = l[k];
        null === c && m.start <= f && f <= m.end && (c = f + m.index);
        if (m.start <= a && a <= m.end) {
          g = a + m.index + 1;
          break;
        }
      }
      return [c, g];
    };
    k.prototype.validate_ref = function (a, d, c) {
      var f;
      (null != a && 0 < a.length) ||
        (a = [{ translation: "default", osis: "", alias: "default" }]);
      var g = !1;
      var l = {};
      var k = 0;
      for (f = a.length; k < f; k++) {
        var m = a[k];
        null == m.alias && (m.alias = "default");
        if (null == m.alias)
          null == l.translation_invalid && (l.translation_invalid = []),
            l.translation_invalid.push(m);
        else {
          null == this.translations.aliases[m.alias] &&
            ((m.alias = "default"),
            null == l.translation_unknown && (l.translation_unknown = []),
            l.translation_unknown.push(m));
          var n = this.validate_start_ref(m.alias, d, l)[0];
          c && (n = this.validate_end_ref(m.alias, d, c, n, l)[0]);
          !0 === n && (g = !0);
        }
      }
      return { valid: g, messages: l };
    };
    k.prototype.validate_start_ref = function (a, d, c) {
      var f, g;
      var l = !0;
      "default" !== a &&
        null ==
          (null != (f = this.translations[a]) ? f.chapters[d.b] : void 0) &&
        this.promote_book_to_translation(d.b, a);
      f =
        null != (null != (g = this.translations[a]) ? g.order : void 0)
          ? a
          : "default";
      null != d.v && (d.v = parseInt(d.v, 10));
      if (null != this.translations[f].order[d.b]) {
        null == d.c && (d.c = 1);
        d.c = parseInt(d.c, 10);
        if (isNaN(d.c)) return (c.start_chapter_not_numeric = !0), [!1, c];
        0 === d.c &&
          ((c.start_chapter_is_zero = 1),
          "error" === this.options.zero_chapter_strategy
            ? (l = !1)
            : (d.c = 1));
        null != d.v &&
          0 === d.v &&
          ((c.start_verse_is_zero = 1),
          "error" === this.options.zero_verse_strategy
            ? (l = !1)
            : "upgrade" === this.options.zero_verse_strategy && (d.v = 1));
        0 < d.c && null != this.translations[a].chapters[d.b][d.c - 1]
          ? null != d.v
            ? isNaN(d.v)
              ? ((l = !1), (c.start_verse_not_numeric = !0))
              : d.v > this.translations[a].chapters[d.b][d.c - 1] &&
                0 <= this.options.passage_existence_strategy.indexOf("v") &&
                ((l = !1),
                (c.start_verse_not_exist = this.translations[a].chapters[d.b][
                  d.c - 1
                ]))
            : 1 === d.c &&
              "verse" === this.options.single_chapter_1_strategy &&
              1 === this.translations[a].chapters[d.b].length &&
              (c.start_chapter_1 = 1)
          : 1 !== d.c && 1 === this.translations[a].chapters[d.b].length
          ? ((l = !1), (c.start_chapter_not_exist_in_single_chapter_book = 1))
          : 0 < d.c &&
            0 <= this.options.passage_existence_strategy.indexOf("c") &&
            ((l = !1),
            (c.start_chapter_not_exist = this.translations[a].chapters[
              d.b
            ].length));
      } else
        null == d.b
          ? ((l = !1), (c.start_book_not_defined = !0))
          : (0 <= this.options.passage_existence_strategy.indexOf("b") &&
              (l = !1),
            (c.start_book_not_exist = !0));
      return [l, c];
    };
    k.prototype.validate_end_ref = function (a, d, c, f, g) {
      var l;
      var k =
        null != (null != (l = this.translations[a]) ? l.order : void 0)
          ? a
          : "default";
      null != c.c &&
        ((c.c = parseInt(c.c, 10)),
        isNaN(c.c)
          ? ((f = !1), (g.end_chapter_not_numeric = !0))
          : 0 === c.c &&
            ((g.end_chapter_is_zero = 1),
            "error" === this.options.zero_chapter_strategy
              ? (f = !1)
              : (c.c = 1)));
      null != c.v &&
        ((c.v = parseInt(c.v, 10)),
        isNaN(c.v)
          ? ((f = !1), (g.end_verse_not_numeric = !0))
          : 0 === c.v &&
            ((g.end_verse_is_zero = 1),
            "error" === this.options.zero_verse_strategy
              ? (f = !1)
              : "upgrade" === this.options.zero_verse_strategy && (c.v = 1)));
      null != this.translations[k].order[c.b]
        ? (null == c.c &&
            1 === this.translations[a].chapters[c.b].length &&
            (c.c = 1),
          null != this.translations[k].order[d.b] &&
            this.translations[k].order[d.b] > this.translations[k].order[c.b] &&
            (0 <= this.options.passage_existence_strategy.indexOf("b") &&
              (f = !1),
            (g.end_book_before_start = !0)),
          d.b !== c.b ||
            null == c.c ||
            isNaN(c.c) ||
            (null == d.c && (d.c = 1),
            !isNaN(parseInt(d.c, 10)) && d.c > c.c
              ? ((f = !1), (g.end_chapter_before_start = !0))
              : d.c !== c.c ||
                null == c.v ||
                isNaN(c.v) ||
                (null == d.v && (d.v = 1),
                !isNaN(parseInt(d.v, 10)) &&
                  d.v > c.v &&
                  ((f = !1), (g.end_verse_before_start = !0)))),
          null == c.c ||
            isNaN(c.c) ||
            null != this.translations[a].chapters[c.b][c.c - 1] ||
            (1 === this.translations[a].chapters[c.b].length
              ? (g.end_chapter_not_exist_in_single_chapter_book = 1)
              : 0 < c.c &&
                0 <= this.options.passage_existence_strategy.indexOf("c") &&
                (g.end_chapter_not_exist = this.translations[a].chapters[
                  c.b
                ].length)),
          null == c.v ||
            isNaN(c.v) ||
            (null == c.c && (c.c = this.translations[a].chapters[c.b].length),
            c.v > this.translations[a].chapters[c.b][c.c - 1] &&
              0 <= this.options.passage_existence_strategy.indexOf("v") &&
              (g.end_verse_not_exist = this.translations[a].chapters[c.b][
                c.c - 1
              ])))
        : ((f = !1), (g.end_book_not_exist = !0));
      return [f, g];
    };
    k.prototype.promote_book_to_translation = function (a, d) {
      var c;
      null == (c = this.translations)[d] && (c[d] = {});
      null == (c = this.translations[d]).chapters && (c.chapters = {});
      if (null == this.translations[d].chapters[a])
        return (this.translations[d].chapters[a] = y.shallow_clone_array(
          this.translations["default"].chapters[a]
        ));
    };
    return k;
  })();
  var y = {
    shallow_clone: function (k) {
      var a;
      if (null == k) return k;
      var d = {};
      for (a in k)
        if (B.call(k, a)) {
          var c = k[a];
          d[a] = c;
        }
      return d;
    },
    shallow_clone_array: function (k) {
      var a, d;
      if (null == k) return k;
      var c = [];
      var f = (a = 0);
      for (d = k.length; 0 <= d ? a <= d : a >= d; f = 0 <= d ? ++a : --a)
        "undefined" !== typeof k[f] && (c[f] = k[f]);
      return c;
    }
  };
  n.prototype.regexps.translations = /(?:(?:(?:E[RS]|AS|TNI|RS|KJ)V|LXX|MSG|CE[BV]|AMP|HCSB|N(?:(?:KJ|RS)V|LT|IR?V|A(?:B(?:RE)?|SB?))))\b/gi;
  n.prototype.translations = {
    aliases: {
      ceb: { alias: "ceb" },
      kjv: { alias: "kjv" },
      lxx: { alias: "nab" },
      nab: { alias: "nab" },
      nabre: { alias: "nab" },
      nas: { osis: "NASB", alias: "default" },
      nirv: { alias: "kjv" },
      niv: { alias: "kjv" },
      nkjv: { alias: "nkjv" },
      nlt: { alias: "nlt" },
      nrsv: { alias: "nrsv" },
      tniv: { alias: "kjv" },
      default: { osis: "", alias: "default" }
    },
    alternates: {},
    default: {
      order: {
        GEN: 1,
        EXO: 2,
        LEV: 3,
        NUM: 4,
        DEU: 5,
        JOS: 6,
        JDG: 7,
        RUT: 8,
        "1SA": 9,
        "2SA": 10,
        "1KI": 11,
        "2KI": 12,
        "1CH": 13,
        "2CH": 14,
        EZR: 15,
        NEH: 16,
        EST: 17,
        JOB: 18,
        PSA: 19,
        PRO: 20,
        ECC: 21,
        SNG: 22,
        ISA: 23,
        JER: 24,
        LAM: 25,
        EZK: 26,
        DAN: 27,
        HOS: 28,
        JOL: 29,
        AMO: 30,
        OBA: 31,
        JON: 32,
        MIC: 33,
        NAM: 34,
        HAB: 35,
        ZEP: 36,
        HAG: 37,
        ZEC: 38,
        MAL: 39,
        MAT: 40,
        MRK: 41,
        LUK: 42,
        JHN: 43,
        ACT: 44,
        ROM: 45,
        "1CO": 46,
        "2CO": 47,
        GAL: 48,
        EPH: 49,
        PHP: 50,
        COL: 51,
        "1TH": 52,
        "2TH": 53,
        "1TI": 54,
        "2TI": 55,
        TIT: 56,
        PHM: 57,
        HEB: 58,
        JAS: 59,
        "1PE": 60,
        "2PE": 61,
        "1JN": 62,
        "2JN": 63,
        "3JN": 64,
        JUD: 65,
        REV: 66,
        Tob: 67,
        Jdt: 68,
        GkEST: 69,
        Wis: 70,
        Sir: 71,
        Bar: 72,
        PrAzar: 73,
        Sus: 74,
        Bel: 75,
        SgThree: 76,
        EpJer: 77,
        "1Macc": 78,
        "2Macc": 79,
        "3Macc": 80,
        "4Macc": 81,
        "1Esd": 82,
        "2Esd": 83,
        PrMan: 84
      },
      chapters: {
        GEN: [
          31,
          25,
          24,
          26,
          32,
          22,
          24,
          22,
          29,
          32,
          32,
          20,
          18,
          24,
          21,
          16,
          27,
          33,
          38,
          18,
          34,
          24,
          20,
          67,
          34,
          35,
          46,
          22,
          35,
          43,
          55,
          32,
          20,
          31,
          29,
          43,
          36,
          30,
          23,
          23,
          57,
          38,
          34,
          34,
          28,
          34,
          31,
          22,
          33,
          26
        ],
        EXO: [
          22,
          25,
          22,
          31,
          23,
          30,
          25,
          32,
          35,
          29,
          10,
          51,
          22,
          31,
          27,
          36,
          16,
          27,
          25,
          26,
          36,
          31,
          33,
          18,
          40,
          37,
          21,
          43,
          46,
          38,
          18,
          35,
          23,
          35,
          35,
          38,
          29,
          31,
          43,
          38
        ],
        LEV: [
          17,
          16,
          17,
          35,
          19,
          30,
          38,
          36,
          24,
          20,
          47,
          8,
          59,
          57,
          33,
          34,
          16,
          30,
          37,
          27,
          24,
          33,
          44,
          23,
          55,
          46,
          34
        ],
        NUM: [
          54,
          34,
          51,
          49,
          31,
          27,
          89,
          26,
          23,
          36,
          35,
          16,
          33,
          45,
          41,
          50,
          13,
          32,
          22,
          29,
          35,
          41,
          30,
          25,
          18,
          65,
          23,
          31,
          40,
          16,
          54,
          42,
          56,
          29,
          34,
          13
        ],
        DEU: [
          46,
          37,
          29,
          49,
          33,
          25,
          26,
          20,
          29,
          22,
          32,
          32,
          18,
          29,
          23,
          22,
          20,
          22,
          21,
          20,
          23,
          30,
          25,
          22,
          19,
          19,
          26,
          68,
          29,
          20,
          30,
          52,
          29,
          12
        ],
        JOS: [
          18,
          24,
          17,
          24,
          15,
          27,
          26,
          35,
          27,
          43,
          23,
          24,
          33,
          15,
          63,
          10,
          18,
          28,
          51,
          9,
          45,
          34,
          16,
          33
        ],
        JDG: [
          36,
          23,
          31,
          24,
          31,
          40,
          25,
          35,
          57,
          18,
          40,
          15,
          25,
          20,
          20,
          31,
          13,
          31,
          30,
          48,
          25
        ],
        RUT: [22, 23, 18, 22],
        "1SA": [
          28,
          36,
          21,
          22,
          12,
          21,
          17,
          22,
          27,
          27,
          15,
          25,
          23,
          52,
          35,
          23,
          58,
          30,
          24,
          42,
          15,
          23,
          29,
          22,
          44,
          25,
          12,
          25,
          11,
          31,
          13
        ],
        "2SA": [
          27,
          32,
          39,
          12,
          25,
          23,
          29,
          18,
          13,
          19,
          27,
          31,
          39,
          33,
          37,
          23,
          29,
          33,
          43,
          26,
          22,
          51,
          39,
          25
        ],
        "1KI": [
          53,
          46,
          28,
          34,
          18,
          38,
          51,
          66,
          28,
          29,
          43,
          33,
          34,
          31,
          34,
          34,
          24,
          46,
          21,
          43,
          29,
          53
        ],
        "2KI": [
          18,
          25,
          27,
          44,
          27,
          33,
          20,
          29,
          37,
          36,
          21,
          21,
          25,
          29,
          38,
          20,
          41,
          37,
          37,
          21,
          26,
          20,
          37,
          20,
          30
        ],
        "1CH": [
          54,
          55,
          24,
          43,
          26,
          81,
          40,
          40,
          44,
          14,
          47,
          40,
          14,
          17,
          29,
          43,
          27,
          17,
          19,
          8,
          30,
          19,
          32,
          31,
          31,
          32,
          34,
          21,
          30
        ],
        "2CH": [
          17,
          18,
          17,
          22,
          14,
          42,
          22,
          18,
          31,
          19,
          23,
          16,
          22,
          15,
          19,
          14,
          19,
          34,
          11,
          37,
          20,
          12,
          21,
          27,
          28,
          23,
          9,
          27,
          36,
          27,
          21,
          33,
          25,
          33,
          27,
          23
        ],
        EZR: [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
        NEH: [11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31],
        EST: [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
        JOB: [
          22,
          13,
          26,
          21,
          27,
          30,
          21,
          22,
          35,
          22,
          20,
          25,
          28,
          22,
          35,
          22,
          16,
          21,
          29,
          29,
          34,
          30,
          17,
          25,
          6,
          14,
          23,
          28,
          25,
          31,
          40,
          22,
          33,
          37,
          16,
          33,
          24,
          41,
          30,
          24,
          34,
          17
        ],
        PSA: [
          6,
          12,
          8,
          8,
          12,
          10,
          17,
          9,
          20,
          18,
          7,
          8,
          6,
          7,
          5,
          11,
          15,
          50,
          14,
          9,
          13,
          31,
          6,
          10,
          22,
          12,
          14,
          9,
          11,
          12,
          24,
          11,
          22,
          22,
          28,
          12,
          40,
          22,
          13,
          17,
          13,
          11,
          5,
          26,
          17,
          11,
          9,
          14,
          20,
          23,
          19,
          9,
          6,
          7,
          23,
          13,
          11,
          11,
          17,
          12,
          8,
          12,
          11,
          10,
          13,
          20,
          7,
          35,
          36,
          5,
          24,
          20,
          28,
          23,
          10,
          12,
          20,
          72,
          13,
          19,
          16,
          8,
          18,
          12,
          13,
          17,
          7,
          18,
          52,
          17,
          16,
          15,
          5,
          23,
          11,
          13,
          12,
          9,
          9,
          5,
          8,
          28,
          22,
          35,
          45,
          48,
          43,
          13,
          31,
          7,
          10,
          10,
          9,
          8,
          18,
          19,
          2,
          29,
          176,
          7,
          8,
          9,
          4,
          8,
          5,
          6,
          5,
          6,
          8,
          8,
          3,
          18,
          3,
          3,
          21,
          26,
          9,
          8,
          24,
          13,
          10,
          7,
          12,
          15,
          21,
          10,
          20,
          14,
          9,
          6
        ],
        PRO: [
          33,
          22,
          35,
          27,
          23,
          35,
          27,
          36,
          18,
          32,
          31,
          28,
          25,
          35,
          33,
          33,
          28,
          24,
          29,
          30,
          31,
          29,
          35,
          34,
          28,
          28,
          27,
          28,
          27,
          33,
          31
        ],
        ECC: [18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14],
        SNG: [17, 17, 11, 16, 16, 13, 13, 14],
        ISA: [
          31,
          22,
          26,
          6,
          30,
          13,
          25,
          22,
          21,
          34,
          16,
          6,
          22,
          32,
          9,
          14,
          14,
          7,
          25,
          6,
          17,
          25,
          18,
          23,
          12,
          21,
          13,
          29,
          24,
          33,
          9,
          20,
          24,
          17,
          10,
          22,
          38,
          22,
          8,
          31,
          29,
          25,
          28,
          28,
          25,
          13,
          15,
          22,
          26,
          11,
          23,
          15,
          12,
          17,
          13,
          12,
          21,
          14,
          21,
          22,
          11,
          12,
          19,
          12,
          25,
          24
        ],
        JER: [
          19,
          37,
          25,
          31,
          31,
          30,
          34,
          22,
          26,
          25,
          23,
          17,
          27,
          22,
          21,
          21,
          27,
          23,
          15,
          18,
          14,
          30,
          40,
          10,
          38,
          24,
          22,
          17,
          32,
          24,
          40,
          44,
          26,
          22,
          19,
          32,
          21,
          28,
          18,
          16,
          18,
          22,
          13,
          30,
          5,
          28,
          7,
          47,
          39,
          46,
          64,
          34
        ],
        LAM: [22, 22, 66, 22, 22],
        EZK: [
          28,
          10,
          27,
          17,
          17,
          14,
          27,
          18,
          11,
          22,
          25,
          28,
          23,
          23,
          8,
          63,
          24,
          32,
          14,
          49,
          32,
          31,
          49,
          27,
          17,
          21,
          36,
          26,
          21,
          26,
          18,
          32,
          33,
          31,
          15,
          38,
          28,
          23,
          29,
          49,
          26,
          20,
          27,
          31,
          25,
          24,
          23,
          35
        ],
        DAN: [21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13],
        HOS: [11, 23, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9],
        JOL: [20, 32, 21],
        AMO: [15, 16, 15, 13, 27, 14, 17, 14, 15],
        OBA: [21],
        JON: [17, 10, 10, 11],
        MIC: [16, 13, 12, 13, 15, 16, 20],
        NAM: [15, 13, 19],
        HAB: [17, 20, 19],
        ZEP: [18, 15, 20],
        HAG: [15, 23],
        ZEC: [21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
        MAL: [14, 17, 18, 6],
        MAT: [
          25,
          23,
          17,
          25,
          48,
          34,
          29,
          34,
          38,
          42,
          30,
          50,
          58,
          36,
          39,
          28,
          27,
          35,
          30,
          34,
          46,
          46,
          39,
          51,
          46,
          75,
          66,
          20
        ],
        MRK: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20],
        LUK: [
          80,
          52,
          38,
          44,
          39,
          49,
          50,
          56,
          62,
          42,
          54,
          59,
          35,
          35,
          32,
          31,
          37,
          43,
          48,
          47,
          38,
          71,
          56,
          53
        ],
        JHN: [
          51,
          25,
          36,
          54,
          47,
          71,
          53,
          59,
          41,
          42,
          57,
          50,
          38,
          31,
          27,
          33,
          26,
          40,
          42,
          31,
          25
        ],
        ACT: [
          26,
          47,
          26,
          37,
          42,
          15,
          60,
          40,
          43,
          48,
          30,
          25,
          52,
          28,
          41,
          40,
          34,
          28,
          41,
          38,
          40,
          30,
          35,
          27,
          27,
          32,
          44,
          31
        ],
        ROM: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27],
        "1CO": [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24],
        "2CO": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14],
        GAL: [24, 21, 29, 31, 26, 18],
        EPH: [23, 22, 21, 32, 33, 24],
        PHP: [30, 30, 21, 23],
        COL: [29, 23, 25, 18],
        "1TH": [10, 20, 13, 18, 28],
        "2TH": [12, 17, 18],
        "1TI": [20, 15, 16, 16, 25, 21],
        "2TI": [18, 26, 17, 22],
        TIT: [16, 15, 15],
        PHM: [25],
        HEB: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25],
        JAS: [27, 26, 18, 17, 20],
        "1PE": [25, 25, 22, 19, 14],
        "2PE": [21, 22, 18],
        "1JN": [10, 29, 24, 21, 21],
        "2JN": [13],
        "3JN": [15],
        JUD: [25],
        REV: [
          20,
          29,
          22,
          11,
          14,
          17,
          17,
          13,
          21,
          11,
          19,
          17,
          18,
          20,
          8,
          21,
          18,
          24,
          21,
          15,
          27,
          21
        ],
        Tob: [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 17, 15],
        Jdt: [16, 28, 10, 15, 24, 21, 32, 36, 14, 23, 23, 20, 20, 19, 14, 25],
        GkEsth: [22, 23, 15, 17, 14, 14, 10, 17, 32, 13, 12, 6, 18, 19, 16, 24],
        Wis: [
          16,
          24,
          19,
          20,
          23,
          25,
          30,
          21,
          18,
          21,
          26,
          27,
          19,
          31,
          19,
          29,
          21,
          25,
          22
        ],
        Sir: [
          30,
          18,
          31,
          31,
          15,
          37,
          36,
          19,
          18,
          31,
          34,
          18,
          26,
          27,
          20,
          30,
          32,
          33,
          30,
          31,
          28,
          27,
          27,
          34,
          26,
          29,
          30,
          26,
          28,
          25,
          31,
          24,
          33,
          31,
          26,
          31,
          31,
          34,
          35,
          30,
          22,
          25,
          33,
          23,
          26,
          20,
          25,
          25,
          16,
          29,
          30
        ],
        Bar: [22, 35, 37, 37, 9],
        PrAzar: [68],
        Sus: [64],
        Bel: [42],
        SgThree: [39],
        EpJer: [73],
        "1Macc": [
          64,
          70,
          60,
          61,
          68,
          63,
          50,
          32,
          73,
          89,
          74,
          53,
          53,
          49,
          41,
          24
        ],
        "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 45, 26, 46, 39],
        "3Macc": [29, 33, 30, 21, 51, 41, 23],
        "4Macc": [
          35,
          24,
          21,
          26,
          38,
          35,
          23,
          29,
          32,
          21,
          27,
          19,
          27,
          20,
          32,
          25,
          24,
          24
        ],
        "1Esd": [58, 30, 24, 63, 73, 34, 15, 96, 55],
        "2Esd": [
          40,
          48,
          36,
          52,
          56,
          59,
          70,
          63,
          47,
          59,
          46,
          51,
          58,
          48,
          63,
          78
        ],
        PrMan: [15],
        PSA151: [7]
      }
    },
    vulgate: {
      chapters: {
        GEN: [
          31,
          25,
          24,
          26,
          32,
          22,
          24,
          22,
          29,
          32,
          32,
          20,
          18,
          24,
          21,
          16,
          27,
          33,
          38,
          18,
          34,
          24,
          20,
          67,
          34,
          35,
          46,
          22,
          35,
          43,
          55,
          32,
          20,
          31,
          29,
          43,
          36,
          30,
          23,
          23,
          57,
          38,
          34,
          34,
          28,
          34,
          31,
          22,
          32,
          25
        ],
        EXO: [
          22,
          25,
          22,
          31,
          23,
          30,
          25,
          32,
          35,
          29,
          10,
          51,
          22,
          31,
          27,
          36,
          16,
          27,
          25,
          26,
          36,
          31,
          33,
          18,
          40,
          37,
          21,
          43,
          46,
          38,
          18,
          35,
          23,
          35,
          35,
          38,
          29,
          31,
          43,
          36
        ],
        Lev: [
          17,
          16,
          17,
          35,
          19,
          30,
          38,
          36,
          24,
          20,
          47,
          8,
          59,
          57,
          33,
          34,
          16,
          30,
          37,
          27,
          24,
          33,
          44,
          23,
          55,
          45,
          34
        ],
        NUM: [
          54,
          34,
          51,
          49,
          31,
          27,
          89,
          26,
          23,
          36,
          34,
          15,
          34,
          45,
          41,
          50,
          13,
          32,
          22,
          30,
          35,
          41,
          30,
          25,
          18,
          65,
          23,
          31,
          39,
          17,
          54,
          42,
          56,
          29,
          34,
          13
        ],
        JOS: [
          18,
          24,
          17,
          25,
          16,
          27,
          26,
          35,
          27,
          44,
          23,
          24,
          33,
          15,
          63,
          10,
          18,
          28,
          51,
          9,
          43,
          34,
          16,
          33
        ],
        JDG: [
          36,
          23,
          31,
          24,
          32,
          40,
          25,
          35,
          57,
          18,
          40,
          15,
          25,
          20,
          20,
          31,
          13,
          31,
          30,
          48,
          24
        ],
        "1SA": [
          28,
          36,
          21,
          22,
          12,
          21,
          17,
          22,
          27,
          27,
          15,
          25,
          23,
          52,
          35,
          23,
          58,
          30,
          24,
          43,
          15,
          23,
          28,
          23,
          44,
          25,
          12,
          25,
          11,
          31,
          13
        ],
        "1KI": [
          53,
          46,
          28,
          34,
          18,
          38,
          51,
          66,
          28,
          29,
          43,
          33,
          34,
          31,
          34,
          34,
          24,
          46,
          21,
          43,
          29,
          54
        ],
        "1CH": [
          54,
          55,
          24,
          43,
          26,
          81,
          40,
          40,
          44,
          14,
          46,
          40,
          14,
          17,
          29,
          43,
          27,
          17,
          19,
          7,
          30,
          19,
          32,
          31,
          31,
          32,
          34,
          21,
          30
        ],
        NEH: [11, 20, 31, 23, 19, 19, 73, 18, 38, 39, 36, 46, 31],
        JOB: [
          22,
          13,
          26,
          21,
          27,
          30,
          21,
          22,
          35,
          22,
          20,
          25,
          28,
          22,
          35,
          23,
          16,
          21,
          29,
          29,
          34,
          30,
          17,
          25,
          6,
          14,
          23,
          28,
          25,
          31,
          40,
          22,
          33,
          37,
          16,
          33,
          24,
          41,
          35,
          28,
          25,
          16
        ],
        PSA: [
          6,
          13,
          9,
          10,
          13,
          11,
          18,
          10,
          39,
          8,
          9,
          6,
          7,
          5,
          10,
          15,
          51,
          15,
          10,
          14,
          32,
          6,
          10,
          22,
          12,
          14,
          9,
          11,
          13,
          25,
          11,
          22,
          23,
          28,
          13,
          40,
          23,
          14,
          18,
          14,
          12,
          5,
          26,
          18,
          12,
          10,
          15,
          21,
          23,
          21,
          11,
          7,
          9,
          24,
          13,
          12,
          12,
          18,
          14,
          9,
          13,
          12,
          11,
          14,
          20,
          8,
          36,
          37,
          6,
          24,
          20,
          28,
          23,
          11,
          13,
          21,
          72,
          13,
          20,
          17,
          8,
          19,
          13,
          14,
          17,
          7,
          19,
          53,
          17,
          16,
          16,
          5,
          23,
          11,
          13,
          12,
          9,
          9,
          5,
          8,
          29,
          22,
          35,
          45,
          48,
          43,
          14,
          31,
          7,
          10,
          10,
          9,
          26,
          9,
          10,
          2,
          29,
          176,
          7,
          8,
          9,
          4,
          8,
          5,
          6,
          5,
          6,
          8,
          8,
          3,
          18,
          3,
          3,
          21,
          26,
          9,
          8,
          24,
          14,
          10,
          8,
          12,
          15,
          21,
          10,
          11,
          9,
          14,
          9,
          6
        ],
        ECC: [18, 26, 22, 17, 19, 11, 30, 17, 18, 20, 10, 14],
        SNG: [16, 17, 11, 16, 17, 12, 13, 14],
        JER: [
          19,
          37,
          25,
          31,
          31,
          30,
          34,
          22,
          26,
          25,
          23,
          17,
          27,
          22,
          21,
          21,
          27,
          23,
          15,
          18,
          14,
          30,
          40,
          10,
          38,
          24,
          22,
          17,
          32,
          24,
          40,
          44,
          26,
          22,
          19,
          32,
          20,
          28,
          18,
          16,
          18,
          22,
          13,
          30,
          5,
          28,
          7,
          47,
          39,
          46,
          64,
          34
        ],
        EZK: [
          28,
          9,
          27,
          17,
          17,
          14,
          27,
          18,
          11,
          22,
          25,
          28,
          23,
          23,
          8,
          63,
          24,
          32,
          14,
          49,
          32,
          31,
          49,
          27,
          17,
          21,
          36,
          26,
          21,
          26,
          18,
          32,
          33,
          31,
          15,
          38,
          28,
          23,
          29,
          49,
          26,
          20,
          27,
          31,
          25,
          24,
          23,
          35
        ],
        DAN: [21, 49, 100, 34, 31, 28, 28, 27, 27, 21, 45, 13, 65, 42],
        HOS: [11, 24, 5, 19, 15, 11, 16, 14, 17, 15, 12, 14, 15, 10],
        AMO: [15, 16, 15, 13, 27, 15, 17, 14, 14],
        JON: [16, 11, 10, 11],
        MIC: [16, 13, 12, 13, 14, 16, 20],
        HAG: [14, 24],
        Matt: [
          25,
          23,
          17,
          25,
          48,
          34,
          29,
          34,
          38,
          42,
          30,
          50,
          58,
          36,
          39,
          28,
          26,
          35,
          30,
          34,
          46,
          46,
          39,
          51,
          46,
          75,
          66,
          20
        ],
        MRK: [45, 28, 35, 40, 43, 56, 37, 39, 49, 52, 33, 44, 37, 72, 47, 20],
        JHN: [
          51,
          25,
          36,
          54,
          47,
          72,
          53,
          59,
          41,
          42,
          57,
          50,
          38,
          31,
          27,
          33,
          26,
          40,
          42,
          31,
          25
        ],
        ACT: [
          26,
          47,
          26,
          37,
          42,
          15,
          59,
          40,
          43,
          48,
          30,
          25,
          52,
          27,
          41,
          40,
          34,
          28,
          40,
          38,
          40,
          30,
          35,
          27,
          27,
          32,
          44,
          31
        ],
        "2CO": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
        REV: [
          20,
          29,
          22,
          11,
          14,
          17,
          17,
          13,
          21,
          11,
          19,
          18,
          18,
          20,
          8,
          21,
          18,
          24,
          21,
          15,
          27,
          21
        ],
        Tob: [25, 23, 25, 23, 28, 22, 20, 24, 12, 13, 21, 22, 23, 17],
        Jdt: [12, 18, 15, 17, 29, 21, 25, 34, 19, 20, 21, 20, 31, 18, 15, 31],
        Wis: [
          16,
          25,
          19,
          20,
          24,
          27,
          30,
          21,
          19,
          21,
          27,
          27,
          19,
          31,
          19,
          29,
          20,
          25,
          20
        ],
        Sir: [
          40,
          23,
          34,
          36,
          18,
          37,
          40,
          22,
          25,
          34,
          36,
          19,
          32,
          27,
          22,
          31,
          31,
          33,
          28,
          33,
          31,
          33,
          38,
          47,
          36,
          28,
          33,
          30,
          35,
          27,
          42,
          28,
          33,
          31,
          26,
          28,
          34,
          39,
          41,
          32,
          28,
          26,
          37,
          27,
          31,
          23,
          31,
          28,
          19,
          31,
          38,
          13
        ],
        Bar: [22, 35, 38, 37, 9, 72],
        "1Macc": [
          67,
          70,
          60,
          61,
          68,
          63,
          50,
          32,
          73,
          89,
          74,
          54,
          54,
          49,
          41,
          24
        ],
        "2Macc": [36, 33, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 40]
      }
    },
    ceb: {
      chapters: {
        "2CO": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
        REV: [
          20,
          29,
          22,
          11,
          14,
          17,
          17,
          13,
          21,
          11,
          19,
          18,
          18,
          20,
          8,
          21,
          18,
          24,
          21,
          15,
          27,
          21
        ],
        Tob: [22, 14, 17, 21, 22, 18, 16, 21, 6, 13, 18, 22, 18, 15],
        PrAzar: [67],
        EpJer: [72],
        "1Esd": [55, 26, 24, 63, 71, 33, 15, 92, 55]
      }
    },
    kjv: { chapters: { "3JN": [14] } },
    nab: {
      order: {
        GEN: 1,
        EXO: 2,
        LEV: 3,
        NUM: 4,
        DEU: 5,
        JOS: 6,
        JDG: 7,
        RUT: 8,
        "1SA": 9,
        "2SA": 10,
        "1KI": 11,
        "2KI": 12,
        "1CH": 13,
        "2CH": 14,
        PrMan: 15,
        EZR: 16,
        NEH: 17,
        "1Esd": 18,
        "2Esd": 19,
        Tob: 20,
        Jdt: 21,
        EST: 22,
        GkEsth: 23,
        "1Macc": 24,
        "2Macc": 25,
        "3Macc": 26,
        "4Macc": 27,
        JOB: 28,
        PSA: 29,
        PRO: 30,
        ECC: 31,
        SNG: 32,
        Wis: 33,
        Sir: 34,
        ISA: 35,
        JER: 36,
        LAM: 37,
        Bar: 38,
        EpJer: 39,
        EZK: 40,
        DAN: 41,
        PrAzar: 42,
        Sus: 43,
        Bel: 44,
        SgThree: 45,
        HOS: 46,
        JOL: 47,
        AMO: 48,
        OBA: 49,
        JON: 50,
        MIC: 51,
        NAM: 52,
        HAB: 53,
        ZEP: 54,
        HAG: 55,
        ZEC: 56,
        MAL: 57,
        MAT: 58,
        MRK: 59,
        LUK: 60,
        JHN: 61,
        ACT: 62,
        ROM: 63,
        "1CO": 64,
        "2CO": 65,
        GAL: 66,
        EPH: 67,
        PHP: 68,
        COL: 69,
        "1TH": 70,
        "2TH": 71,
        "1TI": 72,
        "2TI": 73,
        TIT: 74,
        PHM: 75,
        HEB: 76,
        JAS: 77,
        "1PE": 78,
        "2PE": 79,
        "1JN": 80,
        "2JN": 81,
        "3JN": 82,
        JUD: 83,
        REV: 84
      },
      chapters: {
        GEN: [
          31,
          25,
          24,
          26,
          32,
          22,
          24,
          22,
          29,
          32,
          32,
          20,
          18,
          24,
          21,
          16,
          27,
          33,
          38,
          18,
          34,
          24,
          20,
          67,
          34,
          35,
          46,
          22,
          35,
          43,
          54,
          33,
          20,
          31,
          29,
          43,
          36,
          30,
          23,
          23,
          57,
          38,
          34,
          34,
          28,
          34,
          31,
          22,
          33,
          26
        ],
        Exod: [
          22,
          25,
          22,
          31,
          23,
          30,
          29,
          28,
          35,
          29,
          10,
          51,
          22,
          31,
          27,
          36,
          16,
          27,
          25,
          26,
          37,
          30,
          33,
          18,
          40,
          37,
          21,
          43,
          46,
          38,
          18,
          35,
          23,
          35,
          35,
          38,
          29,
          31,
          43,
          38
        ],
        LEV: [
          17,
          16,
          17,
          35,
          26,
          23,
          38,
          36,
          24,
          20,
          47,
          8,
          59,
          57,
          33,
          34,
          16,
          30,
          37,
          27,
          24,
          33,
          44,
          23,
          55,
          46,
          34
        ],
        Num: [
          54,
          34,
          51,
          49,
          31,
          27,
          89,
          26,
          23,
          36,
          35,
          16,
          33,
          45,
          41,
          35,
          28,
          32,
          22,
          29,
          35,
          41,
          30,
          25,
          19,
          65,
          23,
          31,
          39,
          17,
          54,
          42,
          56,
          29,
          34,
          13
        ],
        DEU: [
          46,
          37,
          29,
          49,
          33,
          25,
          26,
          20,
          29,
          22,
          32,
          31,
          19,
          29,
          23,
          22,
          20,
          22,
          21,
          20,
          23,
          29,
          26,
          22,
          19,
          19,
          26,
          69,
          28,
          20,
          30,
          52,
          29,
          12
        ],
        "1SA": [
          28,
          36,
          21,
          22,
          12,
          21,
          17,
          22,
          27,
          27,
          15,
          25,
          23,
          52,
          35,
          23,
          58,
          30,
          24,
          42,
          16,
          23,
          28,
          23,
          44,
          25,
          12,
          25,
          11,
          31,
          13
        ],
        "2SA": [
          27,
          32,
          39,
          12,
          25,
          23,
          29,
          18,
          13,
          19,
          27,
          31,
          39,
          33,
          37,
          23,
          29,
          32,
          44,
          26,
          22,
          51,
          39,
          25
        ],
        "1KI": [
          53,
          46,
          28,
          20,
          32,
          38,
          51,
          66,
          28,
          29,
          43,
          33,
          34,
          31,
          34,
          34,
          24,
          46,
          21,
          43,
          29,
          54
        ],
        "2KI": [
          18,
          25,
          27,
          44,
          27,
          33,
          20,
          29,
          37,
          36,
          20,
          22,
          25,
          29,
          38,
          20,
          41,
          37,
          37,
          21,
          26,
          20,
          37,
          20,
          30
        ],
        "1CH": [
          54,
          55,
          24,
          43,
          41,
          66,
          40,
          40,
          44,
          14,
          47,
          41,
          14,
          17,
          29,
          43,
          27,
          17,
          19,
          8,
          30,
          19,
          32,
          31,
          31,
          32,
          34,
          21,
          30
        ],
        "2CH": [
          18,
          17,
          17,
          22,
          14,
          42,
          22,
          18,
          31,
          19,
          23,
          16,
          23,
          14,
          19,
          14,
          19,
          34,
          11,
          37,
          20,
          12,
          21,
          27,
          28,
          23,
          9,
          27,
          36,
          27,
          21,
          33,
          25,
          33,
          27,
          23
        ],
        NEH: [11, 20, 38, 17, 19, 19, 72, 18, 37, 40, 36, 47, 31],
        JOB: [
          22,
          13,
          26,
          21,
          27,
          30,
          21,
          22,
          35,
          22,
          20,
          25,
          28,
          22,
          35,
          22,
          16,
          21,
          29,
          29,
          34,
          30,
          17,
          25,
          6,
          14,
          23,
          28,
          25,
          31,
          40,
          22,
          33,
          37,
          16,
          33,
          24,
          41,
          30,
          32,
          26,
          17
        ],
        PSA: [
          6,
          11,
          9,
          9,
          13,
          11,
          18,
          10,
          21,
          18,
          7,
          9,
          6,
          7,
          5,
          11,
          15,
          51,
          15,
          10,
          14,
          32,
          6,
          10,
          22,
          12,
          14,
          9,
          11,
          13,
          25,
          11,
          22,
          23,
          28,
          13,
          40,
          23,
          14,
          18,
          14,
          12,
          5,
          27,
          18,
          12,
          10,
          15,
          21,
          23,
          21,
          11,
          7,
          9,
          24,
          14,
          12,
          12,
          18,
          14,
          9,
          13,
          12,
          11,
          14,
          20,
          8,
          36,
          37,
          6,
          24,
          20,
          28,
          23,
          11,
          13,
          21,
          72,
          13,
          20,
          17,
          8,
          19,
          13,
          14,
          17,
          7,
          19,
          53,
          17,
          16,
          16,
          5,
          23,
          11,
          13,
          12,
          9,
          9,
          5,
          8,
          29,
          22,
          35,
          45,
          48,
          43,
          14,
          31,
          7,
          10,
          10,
          9,
          8,
          18,
          19,
          2,
          29,
          176,
          7,
          8,
          9,
          4,
          8,
          5,
          6,
          5,
          6,
          8,
          8,
          3,
          18,
          3,
          3,
          21,
          26,
          9,
          8,
          24,
          14,
          10,
          8,
          12,
          15,
          21,
          10,
          20,
          14,
          9,
          6
        ],
        ECC: [18, 26, 22, 17, 19, 12, 29, 17, 18, 20, 10, 14],
        SNG: [17, 17, 11, 16, 16, 12, 14, 14],
        ISA: [
          31,
          22,
          26,
          6,
          30,
          13,
          25,
          23,
          20,
          34,
          16,
          6,
          22,
          32,
          9,
          14,
          14,
          7,
          25,
          6,
          17,
          25,
          18,
          23,
          12,
          21,
          13,
          29,
          24,
          33,
          9,
          20,
          24,
          17,
          10,
          22,
          38,
          22,
          8,
          31,
          29,
          25,
          28,
          28,
          25,
          13,
          15,
          22,
          26,
          11,
          23,
          15,
          12,
          17,
          13,
          12,
          21,
          14,
          21,
          22,
          11,
          12,
          19,
          11,
          25,
          24
        ],
        JER: [
          19,
          37,
          25,
          31,
          31,
          30,
          34,
          23,
          25,
          25,
          23,
          17,
          27,
          22,
          21,
          21,
          27,
          23,
          15,
          18,
          14,
          30,
          40,
          10,
          38,
          24,
          22,
          17,
          32,
          24,
          40,
          44,
          26,
          22,
          19,
          32,
          21,
          28,
          18,
          16,
          18,
          22,
          13,
          30,
          5,
          28,
          7,
          47,
          39,
          46,
          64,
          34
        ],
        EZK: [
          28,
          10,
          27,
          17,
          17,
          14,
          27,
          18,
          11,
          22,
          25,
          28,
          23,
          23,
          8,
          63,
          24,
          32,
          14,
          44,
          37,
          31,
          49,
          27,
          17,
          21,
          36,
          26,
          21,
          26,
          18,
          32,
          33,
          31,
          15,
          38,
          28,
          23,
          29,
          49,
          26,
          20,
          27,
          31,
          25,
          24,
          23,
          35
        ],
        DAN: [21, 49, 100, 34, 30, 29, 28, 27, 27, 21, 45, 13, 64, 42],
        HOS: [9, 25, 5, 19, 15, 11, 16, 14, 17, 15, 11, 15, 15, 10],
        JOL: [20, 27, 5, 21],
        JON: [16, 11, 10, 11],
        MIC: [16, 13, 12, 14, 14, 16, 20],
        NAM: [14, 14, 19],
        ZEC: [17, 17, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
        MAL: [14, 17, 24],
        ACT: [
          26,
          47,
          26,
          37,
          42,
          15,
          60,
          40,
          43,
          49,
          30,
          25,
          52,
          28,
          41,
          40,
          34,
          28,
          40,
          38,
          40,
          30,
          35,
          27,
          27,
          32,
          44,
          31
        ],
        "2CO": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
        REV: [
          20,
          29,
          22,
          11,
          14,
          17,
          17,
          13,
          21,
          11,
          19,
          18,
          18,
          20,
          8,
          21,
          18,
          24,
          21,
          15,
          27,
          21
        ],
        Tob: [22, 14, 17, 21, 22, 18, 17, 21, 6, 13, 18, 22, 18, 15],
        Sir: [
          30,
          18,
          31,
          31,
          15,
          37,
          36,
          19,
          18,
          31,
          34,
          18,
          26,
          27,
          20,
          30,
          32,
          33,
          30,
          31,
          28,
          27,
          27,
          33,
          26,
          29,
          30,
          26,
          28,
          25,
          31,
          24,
          33,
          31,
          26,
          31,
          31,
          34,
          35,
          30,
          22,
          25,
          33,
          23,
          26,
          20,
          25,
          25,
          16,
          29,
          30
        ],
        Bar: [22, 35, 38, 37, 9, 72],
        "2Macc": [36, 32, 40, 50, 27, 31, 42, 36, 29, 38, 38, 46, 26, 46, 39]
      }
    },
    nlt: {
      chapters: {
        REV: [
          20,
          29,
          22,
          11,
          14,
          17,
          17,
          13,
          21,
          11,
          19,
          18,
          18,
          20,
          8,
          21,
          18,
          24,
          21,
          15,
          27,
          21
        ]
      }
    },
    nrsv: {
      chapters: {
        "2CO": [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 13],
        REV: [
          20,
          29,
          22,
          11,
          14,
          17,
          17,
          13,
          21,
          11,
          19,
          18,
          18,
          20,
          8,
          21,
          18,
          24,
          21,
          15,
          27,
          21
        ]
      }
    }
  };
  n.prototype.languages = ["en"];
  n.prototype.regexps.space = "[\\s\\xa0]";
  n.prototype.regexps.escaped_passage = RegExp(
    "(?:^|[^\\x1f\\x1e\\dA-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:[\\u2013\\u2014\\-]|through|thru|to)\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:ch(?:apters?|a?pts?\\.?|a?p?s?\\.?)?\\s*\\d+\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*)|(?:\\d+(?:th|nd|st)\\s*ch(?:apter|a?pt\\.?|a?p?\\.?)?\\s*(?:from|of|in)(?:\\s+the\\s+book\\s+of)?\\s*))?\\x1f(\\d+)(?:/\\d+)?\\x1f(?:/\\d+\\x1f|[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014]|title(?![a-z])|see" +
      n.prototype.regexps.space +
      "+also|ff(?![a-z0-9])|f(?![a-z0-9])|chapters|chapter|through|compare|chapts|verses|chpts|chapt|chaps|verse|chap|thru|also|chp|chs|cha|and|see|ver|vss|ch|to|cf|vs|vv|v|[a-e](?!\\w)|$)+)",
    "gi"
  );
  n.prototype.regexps.match_end_split = /\d\W*title|\d\W*(?:ff(?![a-z0-9])|f(?![a-z0-9]))(?:[\s\xa0*]*\.)?|\d[\s\xa0*]*[a-e](?!\w)|\x1e(?:[\s\xa0*]*[)\]\uff09])?|[\d\x1f]/gi;
  n.prototype.regexps.control = /[\x1e\x1f]/g;
  n.prototype.regexps.pre_book =
    "[^A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff]";
  n.prototype.regexps.first =
    "(?:1st|1|I|First)\\.?" + n.prototype.regexps.space + "*";
  n.prototype.regexps.second =
    "(?:2nd|2|II|Second)\\.?" + n.prototype.regexps.space + "*";
  n.prototype.regexps.third =
    "(?:3rd|3|III|Third)\\.?" + n.prototype.regexps.space + "*";
  n.prototype.regexps.range_and =
    "(?:[&\u2013\u2014-]|(?:and|compare|cf|see" +
    n.prototype.regexps.space +
    "+also|also|see)|(?:through|thru|to))";
  n.prototype.regexps.range_only = "(?:[\u2013\u2014-]|(?:through|thru|to))";
  n.prototype.regexps.get_books = function (k, a) {
    var d;
    var c = [
      {
        osis: ["PSA"],
        apocrypha: !0,
        extra: "2",
        regexp: /(\b)(PSA151)(?=\.1)/g
      },
      {
        osis: ["GEN"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Genes[ei]s)|(?:G(?:e(?:n(?:n(?:e(?:is(?:[eiu]s)?|s[eiu]s|es[eiu]s)|(?:i[ei]s[eiu]|is[eiu]|si)s)|(?:eis[eiu]|esu|si)s|es[ei]|eis|is[eiu]s|(?:i[ei]|ee)s[eiu]s)?)?|n)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["EXO"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ex(?:o(?:d(?:[iu]s|[es])?)?|d)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Bel"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Bel(?:[\\s\\xa0]*(?:and[\\s\\xa0]*(?:the[\\s\\xa0]*(?:S(?:erpent|nake)|Dragon)|S(?:erpent|nake)|Dragon)|&[\\s\\xa0]*(?:the[\\s\\xa0]*(?:S(?:erpent|nake)|Dragon)|S(?:erpent|nake)|Dragon)))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["LEV"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:L(?:e(?:v(?:it[ei]?cus|i|et[ei]?cus)?)?|iv[ei]t[ei]?cus|v)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Num"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:N(?:u(?:m(?:b(?:ers?)?)?)?|m)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Sir"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Sirach)|(?:Wisdom[\\s\\xa0]*of[\\s\\xa0]*Jesus(?:[\\s\\xa0]*(?:Son[\\s\\xa0]*of|ben)|,[\\s\\xa0]*Son[\\s\\xa0]*of)[\\s\\xa0]*Sirach|Ecc(?:l[eu]siasticu)?s|Ben[\\s\\xa0]*Sira|Sir|Ecclus|The[\\s\\xa0]*Wisdom[\\s\\xa0]*of[\\s\\xa0]*Jesus(?:[\\s\\xa0]*(?:Son[\\s\\xa0]*of|ben)|,[\\s\\xa0]*Son[\\s\\xa0]*of)[\\s\\xa0]*Sirach))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Wis"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Wis(?:(?:d(?:om)?)?[\\s\\xa0]*of[\\s\\xa0]*Solomon|d(?:om)?|om[\\s\\xa0]*of[\\s\\xa0]*Solomon)?|The[\\s\\xa0]*Wis(?:d(?:om)?|om)?[\\s\\xa0]*of[\\s\\xa0]*Solomon))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["LAM"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:L(?:a(?:m(?:[ei]ntations?)?)?|m)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["EpJer"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ep(?:istle[\\s\\xa0]*of[\\s\\xa0]*Jeremy|[\\s\\xa0]*?Jer|istle[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|[\\s\\xa0]*of[\\s\\xa0]*Jeremiah)|Let[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|(?:Let(?:ter|\\.)|Ep\\.)[\\s\\xa0]*of[\\s\\xa0]*Jeremiah|The[\\s\\xa0]*(?:Ep(?:istle|\\.)?|Let(?:ter|\\.)?)[\\s\\xa0]*of[\\s\\xa0]*Jeremiah))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["REV"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:R(?:e(?:v(?:elations?|el|lations?|[ao]lations?)?)?|v)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PrMan"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Pr(?:ayer(?:s[\\s\\xa0]*(?:of[\\s\\xa0]*)?|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)Manasseh|[\\s\\xa0]*Manasseh|[\\s\\xa0]*?Man|[\\s\\xa0]*of[\\s\\xa0]*Manasseh)|The[\\s\\xa0]*Pr(?:ayer(?:s[\\s\\xa0]*(?:of[\\s\\xa0]*)?|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)|[\\s\\xa0]*(?:of[\\s\\xa0]*)?)Manasseh))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["DEU"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Duet[eo]rono?my)|(?:D(?:e(?:u(?:t[eo]rono?my|trono?my|t)?|et(?:[eo]rono?|rono?)my)|uut(?:[eo]rono?|rono?)my|uetrono?my|(?:ue)?t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JOS"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:o(?:s(?:h?ua|h)?|ush?ua)|sh)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JDG"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:udg(?:es)?|d?gs|d?g)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["RUT"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:R(?:u(?:th?)?|th?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["1Esd"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:1(?:st)?|I)[\s\xa0]*Esd(?:r(?:as)?)?|1Esd|(?:1(?:st)?|I)\.[\s\xa0]*Esd(?:r(?:as)?)?|First[\s\xa0]*Esd(?:r(?:as)?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2Esd"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:2(?:nd)?|II)[\s\xa0]*Esd(?:r(?:as)?)?|2Esd|(?:2(?:nd)?|II)\.[\s\xa0]*Esd(?:r(?:as)?)?|Second[\s\xa0]*Esd(?:r(?:as)?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["ISA"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Isaisha?)|(?:I(?:s(?:a(?:a(?:[ai](?:[ai]ha?|ha?)|ha?)|i[ai](?:[ai]ha?|ha?)|i?ha?|i)?|i[ai](?:[ai](?:[ai]ha?|ha?)|ha?)|iha|sah)?|a)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["2SA"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:2(?:nd)?|II)\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|(?:2(?:nd)?|II)[\s\xa0]*S(?:amu[ae]l[ls]|ma)|Second[\s\xa0]*S(?:amu[ae]l[ls]|ma))|(?:2(?:[\s\xa0]*Samu[ae]l|(?:[\s\xa0]*S|Sa)m|[\s\xa0]*S(?:am?)?|[\s\xa0]*Kingdoms)|(?:2nd|II)[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|(?:2(?:nd)?|II)\.[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|Second[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1SA"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:1st(?:\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|[\s\xa0]*S(?:amu[ae]l[ls]|ma)))|(?:1(?:st(?:\.[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms))|\.[\s\xa0]*S(?:amu[ae]l[ls]|ma)|[\s\xa0]*S(?:amu[ae]l[ls]|ma))|(?:First|I\.)[\s\xa0]*S(?:amu[ae]l[ls]|ma)|I[\s\xa0]*S(?:amu[ae]l[ls]|ma))|(?:1(?:[\s\xa0]*Samu[ae]l|(?:[\s\xa0]*S|Sa)m|[\s\xa0]*S(?:am?)?|[\s\xa0]*Kingdoms)|I[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|[1I]\.[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms)|First[\s\xa0]*(?:S(?:amu[ae]l|m|am?)|Kingdoms))|(?:Samu[ae]l[ls]?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2KI"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:Second|2\.)[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2nd(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|II(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?))s|(?:Second|2\.)[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|2nd(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|II(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|2Kgs|(?:4(?:th)?|IV)[\s\xa0]*Kingdoms|(?:4(?:th)?|IV)\.[\s\xa0]*Kingdoms|Fourth[\s\xa0]*Kingdoms))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1KI"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:1(?:st)?\.|First)[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?|1(?:st)?[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?|I(?:\.[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)|ng?|g)?))s|(?:1(?:st)?\.|First)[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|1(?:st)?[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|I(?:\.[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?|[\s\xa0]*K(?:i(?:ng?|g)?|ng?|g)?)|1Kgs|(?:3(?:rd)?|III)[\s\xa0]*Kingdoms|(?:3(?:rd)?|III)\.[\s\xa0]*Kingdoms|Third[\s\xa0]*Kingdoms)|(?:K(?:in(?:gs)?|n?gs)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2CH"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:2[\s\xa0]*C(?:h(?:oron[io]|ron[io])|ron[io])|(?:2nd|II)[\s\xa0]*Chrono|(?:2(?:nd)?|II)\.[\s\xa0]*Chrono|Second[\s\xa0]*Chrono)cles)|(?:(?:2nd|II)[\s\xa0]*(?:C(?:h(?:r(?:on(?:icals|ocle)|n|onicles)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oron[io]cle)|ron(?:[io]cle)?|oron[io]cle)|Paralipomenon)|2(?:[\s\xa0]*C(?:h(?:oron[io]|rono)|ron[io])cle|[\s\xa0]*Chronicle|[\s\xa0]*Chrn|Chr|[\s\xa0]*Chronicals|[\s\xa0]*Coron[io]cles|[\s\xa0]*C(?:h(?:r(?:on?)?)?|ron|oron[io]cle)|[\s\xa0]*Paralipomenon)|(?:2(?:nd)?|II)\.[\s\xa0]*(?:C(?:h(?:r(?:on(?:icals|ocle)|n|onicles)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oron[io]cle)|ron(?:[io]cle)?|oron[io]cle)|Paralipomenon)|Second[\s\xa0]*(?:C(?:h(?:r(?:on(?:icals|ocle)|n|onicles)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oron[io]cle)|ron(?:[io]cle)?|oron[io]cle)|Paralipomenon)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1CH"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:1[\s\xa0]*Ch(?:orono|roni)|(?:1st|I)[\s\xa0]*Chrono|(?:1(?:st)?|I)\.[\s\xa0]*Chrono|First[\s\xa0]*Chrono)cles)|(?:1(?:[\s\xa0]*Chronicle|[\s\xa0]*Chrn|Chr)|(?:1[\s\xa0]*Chorono|Choroni)cle|1[\s\xa0]*C(?:ron[io]|hrono|oron[io])cles|1[\s\xa0]*Chronicals|1[\s\xa0]*Choronicles|1[\s\xa0]*C(?:(?:ron[io]|hrono|oron[io])cle|h(?:r(?:on?)?)?|ron)|1[\s\xa0]*Paralipomenon|(?:1st|I)[\s\xa0]*(?:C(?:h(?:r(?:onocle|n|onicles|onicals)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oronocle)|(?:oron[io]|ron[io])cle|ron)|Paralipomenon)|(?:1(?:st)?|I)\.[\s\xa0]*(?:C(?:h(?:r(?:onocle|n|onicles|onicals)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oronocle)|(?:oron[io]|ron[io])cle|ron)|Paralipomenon)|First[\s\xa0]*(?:C(?:h(?:r(?:onocle|n|onicles|onicals)|oron[io]cles)|(?:oron[io]|ron[io])cles|h(?:r(?:onicle|on?)?|oronocle)|(?:oron[io]|ron[io])cle|ron)|Paralipomenon))|(?:C(?:(?:h(?:ron(?:ic(?:al|le)|ocle)|oron[io]cle)|(?:oron[io]|ron[io])cle)s|(?:h(?:ron[io]|orono)|oron[io]|ron[io])cle)|Paralipomenon))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["EZR"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:E(?:zra?|sra)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["NEH"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ne(?:h(?:[ei]m(?:i(?:a[ai]h|a?h|a|i[ai]?h)|a(?:[ai][ai]?)?h)|amiah|amia)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["GkEsth"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:G(?:r(?:eek[\\s\\xa0]*Esther|[\\s\\xa0]*Esth)|k[\\s\\xa0]*?Esth|r(?:eek[\\s\\xa0]*Esth?|[\\s\\xa0]*Est)|k[\\s\\xa0]*Est)|Esther[\\s\\xa0]*\\(Greek\\)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["EST"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Es(?:t(?:h(?:er|r)?|er)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JOB"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Jo?b))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PSA"],
        extra: "1",
        regexp: RegExp(
          "(\\b)((?:(?:(?:1[02-5]|[2-9])?(?:1" +
            n.prototype.regexps.space +
            "*st|2" +
            n.prototype.regexps.space +
            "*nd|3" +
            n.prototype.regexps.space +
            "*rd))|1?1[123]" +
            n.prototype.regexps.space +
            "*th|(?:150|1[0-4][04-9]|[1-9][04-9]|[4-9])" +
            n.prototype.regexps.space +
            "*th)" +
            n.prototype.regexps.space +
            "*Psalm)\\b",
          "gi"
        )
      },
      {
        osis: ["PSA"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Psmals)|(?:Ps(?:a(?:(?:lm[alm]|mm)s?|(?:l[al]|ml)ms?|alms?)|(?:m(?:alm|l)|lam)s?|mal|lalms?))|(?:Psal[am]s?)|(?:Psals?)|(?:P(?:s(?:l(?:m[ms]|a)|m[am]|sm|a(?:m(?:l[as]|s)|aa))|asms|(?:a(?:s(?:ml|s)|m[ls]|l[lm])|s(?:a(?:am|ma)|lma))s|s(?:a(?:ml?)?|m|s|lm)?|a(?:ls|sl)ms?|l(?:a(?:s(?:m(?:as?|s)?|s)?|m(?:a?s)?|as?)|s(?:a?m|sss)s?|s(?:ss?|a)|ms))|Salms?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PrAzar"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Pr(?:[\\s\\xa0]*Aza|Aza?)r|Azariah?|Pr[\\s\\xa0]*of[\\s\\xa0]*Azariah?|Prayer(?:s[\\s\\xa0]*of[\\s\\xa0]*Azariah?|[\\s\\xa0]*of[\\s\\xa0]*Azariah?)|The[\\s\\xa0]*Pr(?:ayer(?:s[\\s\\xa0]*of[\\s\\xa0]*Azariah?|[\\s\\xa0]*of[\\s\\xa0]*Azariah?)|[\\s\\xa0]*of[\\s\\xa0]*Azariah?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PRO"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Prover?bs)|(?:Prverbs)|(?:P(?:r(?:(?:ever|v)bs|verb|everb|vb|v|o(?:bv?erbs|verb|v)?)?|or?verbs|v)|Oroverbs))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["ECC"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ec(?:les(?:i(?:a(?:ias|s)?|s)|sias?)t|clesia(?:sti?|t))es)|(?:Ec(?:c(?:l(?:es(?:i(?:a(?:s?te|st|ates|astes|ia?stes)|(?:ias|s)?tes)|(?:ai?|sia)stes|(?:sia|ai)tes|(?:aia|sai)stes)?)?)?|lesiaste|l)?|Qo(?:heleth|h)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["SgThree"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:S(?:[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|(?:g[\s\xa0]*?|ng[\s\xa0]*|ong[\s\xa0]*)Three|\.[\s\xa0]*(?:of[\s\xa0]*(?:Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|Th(?:ree(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y))|3(?:\.[\s\xa0]*(?:Ch|Y)|[\s\xa0]*(?:Ch|Y)))|g[\s\xa0]*Thr)|The[\s\xa0]*Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children))|Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)))|(?:Song[\s\xa0]*of[\s\xa0]*(?:the[\s\xa0]*(?:Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children))|Three[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children)|3[\s\xa0]*(?:(?:Youth|Jew)s|Young[\s\xa0]*Men|Holy[\s\xa0]*Children))))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["SNG"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:The[\\s\\xa0]*Song(?:s[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?)|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))|S(?:o[Sln]|S|[\\s\\xa0]*of[\\s\\xa0]*S|o|n?gs?))|(?:Song(?:s(?:[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))?|[\\s\\xa0]*of[\\s\\xa0]*S(?:o(?:lom[ao]ns?|ngs?)|alom[ao]ns?))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JER"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:e(?:r(?:(?:im(?:i[ai]|a)|m[im]a|a(?:m[ai]i|ia))h|(?:ama|imi)h|amiha|amiah|amia|amih|e(?:m(?:i(?:ha|e|ah|a|h|ih)?|a(?:ia?)?h))?)?)?|r)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["EZK"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Eze[ei]ki?el)|(?:E(?:z(?:ek(?:i[ae]|e)l|ek?|k|i(?:[ei]ki?|ki?)el)|x[ei](?:[ei]ki?|ki?)el)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["DAN"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:D(?:a(?:n(?:i[ae]l)?)?|[ln])))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["HOS"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:H(?:o(?:s(?:ea)?)?|s)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JOL"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:oel?|l)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["AMO"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Am(?:os?|s)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["OBA"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ob(?:a(?:d(?:iah?)?)?|idah|d)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JON"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:on(?:ah)?|nh)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["MIC"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Mi(?:c(?:hah?|ah?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["NAM"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Na(?:h(?:um?)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["HAB"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Hab(?:ak(?:k[au]kk?|[au]kk?)|k|bak(?:k[au]kk?|[au]kk?))?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["ZEP"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Z(?:e(?:p(?:h(?:an(?:aiah?|iah?))?)?|faniah?)|a(?:ph|f)aniah?|ph?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["HAG"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:H(?:ag(?:g(?:ia[hi]|ai)?|ai)?|gg?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["ZEC"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Z(?:ec(?:h(?:[ae]r(?:i(?:a?h|a|ih)|a[ai]?h))?)?|(?:ekaria|c)h|ekaria|c|a(?:c(?:h(?:[ae]r(?:i(?:a?h|a|ih)|a[ai]?h))?)?|kariah))))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["MAL"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Mal(?:ac(?:hi?|i)|ichi)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["MAT"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i)))ew)|(?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))|Mtt)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i)))ew)|(?:(?:S(?:t(?:\\.[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i)|[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|aint[\\s\\xa0]*Matt(?:h(?:[ht]i?|i)|thi?|t?i))|Matt(?:h(?:[ht]i?|i)|thi?|t?i))ew)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?))ew)|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))))|(?:(?:S(?:t(?:\\.[\\s\\xa0]*Matt[ht]?|[\\s\\xa0]*Matt[ht]?)|aint[\\s\\xa0]*Matt[ht]?)|Matt[ht]?)ew)|(?:S(?:t(?:\\.[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)|[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t))|aint[\\s\\xa0]*M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))|(?:M(?:at(?:h(?:[ht](?:[ht]i?|i)?|i)?ew|th?we|t)?|t)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["MRK"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))))|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?)))|S(?:t(?:\\.[\\s\\xa0]*M(?:rk?|k|ark?)|[\\s\\xa0]*M(?:rk?|k|ark?))|aint[\\s\\xa0]*M(?:rk?|k|ark?))|M(?:rk?|k|ark?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["LUK"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))))|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k)))|S(?:t(?:\\.[\\s\\xa0]*L(?:u(?:ke?)?|k)|[\\s\\xa0]*L(?:u(?:ke?)?|k))|aint[\\s\\xa0]*L(?:u(?:ke?)?|k))|L(?:u(?:ke?)?|k)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["1JN"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:1(?:st)?|I)[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|1John|(?:1(?:st)?|I)\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|First[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2JN"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:2(?:nd)?|II)[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|2John|(?:2(?:nd)?|II)\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|Second[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["3JN"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:3(?:rd)?|III)[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|3John|(?:3(?:rd)?|III)\.[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)|Third[\s\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)?|h[ho]n|h?n|h|phn)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["JHN"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:The[\\s\\xa0]*Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))))|(?:Gospel[\\s\\xa0]*(?:according[\\s\\xa0]*to[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|of[\\s\\xa0]*(?:S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)))|S(?:t(?:\\.[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)|[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|aint[\\s\\xa0]*J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn))|J(?:o(?:h[mn]|nh|h|on|phn)|h[ho]n|h?n|h|phn)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["ACT"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Actsss)|(?:Actss)|(?:Ac(?:ts[\\s\\xa0]*of[\\s\\xa0]*the[\\s\\xa0]*Apostles|ts?)?|The[\\s\\xa0]*Acts[\\s\\xa0]*of[\\s\\xa0]*the[\\s\\xa0]*Apostles))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["ROM"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:R(?:o(?:m(?:a(?:n(?:ds|s)?|sn)|s)?|amns|s)?|m(?:n?s|n)?|pmans)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["2CO"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:2(?:nd)?|II)\.[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|(?:2(?:nd)?|II)[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|Second[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian))s)|(?:(?:(?:2(?:nd)?|II)\.[\s\xa0]*Corin(?:itha|thai)|(?:2(?:nd)?|II)[\s\xa0]*Corin(?:itha|thai)|Second[\s\xa0]*Corin(?:itha|thai))ns)|(?:(?:(?:2(?:nd)?|II)\.|2(?:nd)?|II|Second)[\s\xa0]*Corinthans)|(?:(?:2(?:nd)?|II)[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|2Cor|(?:2(?:nd)?|II)\.[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|Second[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1CO"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:1(?:st)?|I)\.[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|(?:1(?:st)?|I)[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian)|First[\s\xa0]*Cor(?:in(?:(?:t(?:h(?:i(?:a[ai]|o)|oa)|i[ao])|ithai)n|thia?n|(?:th[io]|ith)ian|thaian|[an]thian)|thian))s)|(?:(?:(?:1(?:st)?|I)\.[\s\xa0]*Corin(?:itha|thai)|(?:1(?:st)?|I)[\s\xa0]*Corin(?:itha|thai)|First[\s\xa0]*Corin(?:itha|thai))ns)|(?:(?:(?:1(?:st)?|I)\.|1(?:st)?|I|First)[\s\xa0]*Corinthans)|(?:(?:1(?:st)?|I)[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|1Cor|(?:1(?:st)?|I)\.[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns)|First[\s\xa0]*C(?:o(?:r(?:(?:n(?:ithaia|thai)|rin?thai|ninthai|nthia)ns|n(?:i(?:thai?|ntha)|thi)ns|thian|th|(?:(?:rin?|an|nin?)th|nthi)ians|i(?:(?:n(?:thi(?:an[ao]|na)|ithina)|th[ai]n)s|n(?:t(?:h(?:ian)?)?)?|th(?:ai|ia)ns|th(?:ii|o)ans|inthii?ans))?)?|hor(?:(?:[in]|an)thia|inth(?:ai|ia|i))ns))|(?:C(?:or(?:i(?:(?:n(?:th(?:i(?:an[ao]|na)|ai?n)|ith(?:ina|an))|th[ai]n)s|nthi(?:a?ns|an)|(?:n(?:t(?:h(?:i(?:a[ai]|o)|aia)|i[ao])|ith(?:ai|ia))|th(?:ai|ia))ns|(?:n(?:[an]th|thi)i|th(?:ii|o))ans|nthoi?ans|inthii?ans)|(?:(?:rin?tha|ntha)i|nthia|ninthai|nithaia|n(?:intha|thi|ithai?)|(?:(?:nin?|rin?)th|nthi)ia)ns)|hor(?:inth(?:ai|ia|i)|(?:a?n|i)thia)ns)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["GAL"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:G(?:a(?:l(?:a(?:t(?:(?:i(?:on[an]|nan|an[ai])|o?n)s|i(?:na?|on?|an?)s|ian|(?:i(?:a[ai]|oa)|oa)ns|ii[ao]?ns|a(?:[ao]n|n|i[ao]?n)?s)?)?|lati[ao]?ns)?)?|l)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["EPH"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Eph(?:es(?:i(?:an[ds]|ons)|ains)|i?sians))|(?:E(?:p(?:h(?:es(?:ai|ia)|i?sia)n|h(?:es?|s)?|e(?:he)?sians)?|hp(?:[ei]sians)?|sphesians)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PHP"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ph(?:il(?:ip(?:p(?:(?:i(?:a[ai]|ia|e)|(?:pi|e)a)n|ia?n|a(?:ia?)?n)|(?:i(?:[ae]|ia)?|ea?|a(?:ia?)?)n)s|p(?:(?:(?:pii|e|ppi)a|pia|ai)ns|an|ia?ns))|l(?:ipp?ians|pp)))|(?:Ph(?:i(?:l(?:l(?:i(?:p(?:(?:ai?|ia|ea)ns|(?:ai?|ia|ea)n|ie?ns|(?:i(?:a[ai]|ea)|aia|iia)ns|p(?:i(?:(?:[ei]a)?ns|a(?:ins|ns?))|(?:pia|ai)ns|eans?|ans))?)?|(?:l(?:ipi|p|i?pp)ia|p(?:ie|a))ns|(?:li|p)?pians|(?:li|p)?pian)|(?:ip(?:p(?:i?a|i|ea|pia)|ai?|ia)|pp?ia)n|i(?:pp?)?|pp?)?)?|(?:l(?:ip)?|li)?p)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["COL"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Colossians)|(?:Colossian)|(?:C(?:o(?:l(?:(?:[ao]|as|l[ao])si[ao]|oss(?:io|a))ns|l(?:oss)?)?|al(?:l(?:os(?:i[ao]|sia)|asi[ao])|(?:[ao]s|[ao])si[ao])ns)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["2TH"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:2(?:nd)?|II)\.|2(?:nd)?|II|Second)[\s\xa0]*Thsss)|(?:(?:2(?:nd)?|II)[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|2Thess|(?:2(?:nd)?|II)\.[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|Second[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1TH"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:1(?:st)?|I)\.|1(?:st)?|I|First)[\s\xa0]*Thsss)|(?:(?:1(?:st)?|I)[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|1Thess|(?:1(?:st)?|I)\.[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?|First[\s\xa0]*Th(?:es(?:s(?:al(?:on(?:i(?:(?:[ao]a|io|e)ns|[ao]ns|[ao]n|ns|c(?:i[ae]|a)ns)|(?:(?:oi?|e)a|cie|aia)ns|a(?:ins?|ns))|lonians)|(?:[eo]lonian)?s|[eo]lonian|olonins|elonains)?|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)?|ss|s)?)|(?:Thes(?:s(?:al(?:on(?:i(?:[ao]ns|[ao]n|ns|(?:[ao]a|io)ns|c(?:i[ae]|a)ns)|(?:cie|ea|oi?a|aia)ns|a(?:ins?|ns))|lonians)|[eo]lonians|[eo]lonian|olonins|elonains)|(?:al(?:oni[ci]|loni)a|alonio|elonai)ns|[aeo]lonians|[aeo]lonian|alonins)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["2TI"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:2(?:nd)?|II)\.[\s\xa0]*Timoth?|(?:2(?:nd)?|II)[\s\xa0]*Timoth?|Second[\s\xa0]*Timoth?)y)|(?:(?:2(?:nd)?|II)[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|2Tim|(?:2(?:nd)?|II)\.[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|Second[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1TI"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:(?:1(?:st)?|I)\.[\s\xa0]*Timoth?|(?:1(?:st)?|I)[\s\xa0]*Timoth?|First[\s\xa0]*Timoth?)y)|(?:(?:1(?:st)?|I)[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|1Tim|(?:1(?:st)?|I)\.[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y)|First[\s\xa0]*T(?:imoth|m|im?|omothy|himoth?y))|(?:Timothy?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["TIT"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ti(?:t(?:us)?)?))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PHM"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ph(?:l?mn|l?m|l[ei]mon|ile(?:m(?:on)?)?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["HEB"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:H(?:e(?:b(?:(?:w(?:er|re)|ew[erw]|erw|r(?:rw|we|eww))s|r(?:ew?|w)?s|rew)?|[ew]breww?s)|(?:w[ew]breww?|w?breww?)s)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JAS"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:a(?:m(?:es?)?|s)?|ms?)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["2PE"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:2(?:nd)?|II)[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|2Pet|(?:2(?:nd)?|II)\.[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|Second[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1PE"],
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:1(?:st)?|I)[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|1Pet|(?:1(?:st)?|I)\.[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?|First[\s\xa0]*P(?:e(?:t(?:er?|r)?|r)?|tr?)?)|(?:Peter))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["JUD"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ju?de))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Tob"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:T(?:ob(?:i(?:as|t)?|t)?|b)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Jdt"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:ud(?:ith?|th?)|d(?:ith?|th?))))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Bar"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:B(?:ar(?:uch)?|r)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["Sus"],
        apocrypha: !0,
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:S(?:us(?:annah|anna)?|hoshana)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["2Macc"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:2(?:nd)?|II)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:2(?:nd)?|II)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|Second[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:2(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c|[\s\xa0]*Ma)|(?:2nd|II)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:2(?:nd)?|II)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|Second[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["3Macc"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:3(?:rd)?|III)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:3(?:rd)?|III)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|Third[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:3(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c)|(?:3rd|III)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:3(?:rd)?|III)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|Third[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["4Macc"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:4(?:th)?|IV)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:4(?:th)?|IV)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|Fourth[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:4(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c)|(?:4th|IV)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:4(?:th)?|IV)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|Fourth[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["1Macc"],
        apocrypha: !0,
        regexp: /(^|[^0-9A-Za-z\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u024f\u1e00-\u1eff\u2c60-\u2c7f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua7ff])((?:(?:1(?:st)?|I)\.[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|(?:1(?:st)?|I)[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?))|First[\s\xa0]*Macc(?:abb(?:e(?:e[es]?|s)?|be[es]?)|cab(?:e(?:e[es]?|s)?|be[es]?)))|(?:1(?:[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:Mac|[\s\xa0]*M)c|[\s\xa0]*Ma)|(?:1st|I)[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|(?:1(?:st)?|I)\.[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?|First[\s\xa0]*Mac(?:ab(?:b(?:e(?:(?:ee?)?s|ee?)?|be(?:e[es]?|s)?)|e(?:(?:ee?)?s|ee?)?)|c(?:abe(?:ee?)?s|cabbbe)|cabe(?:ee?)?|cc?)?)|(?:Maccabees))(?:(?=[\d\s\xa0.:,;\x1e\x1f&\(\)\uff08\uff09\[\]\/"'\*=~\-\u2013\u2014])|$)/gi
      },
      {
        osis: ["EZK", "EZR"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ez))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["HAB", "HAG"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ha))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["HEB", "HAB"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Hb))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JHN", "JON", "JOB", "JOS", "JOL"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Jo))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["JUD", "JDG"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:J(?:ud?|d)))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["MAT", "MRK", "MAL"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ma))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["PHP", "PHM"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ph))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      },
      {
        osis: ["ZEP", "ZEC"],
        regexp: RegExp(
          "(^|" +
            n.prototype.regexps.pre_book +
            ")((?:Ze))(?:(?=[\\d\\s\\xa0.:,;\\x1e\\x1f&\\(\\)\\uff08\\uff09\\[\\]/\"'\\*=~\\-\\u2013\\u2014])|$)",
          "gi"
        )
      }
    ];
    if (!0 === k && "none" === a) return c;
    var f = [];
    var g = 0;
    for (d = c.length; g < d; g++) {
      var l = c[g];
      if (!1 !== k || null == l.apocrypha || !0 !== l.apocrypha)
        "books" === a && (l.regexp = new RegExp(l.regexp.source, "g")),
          f.push(l);
    }
    return f;
  };
  n.prototype.regexps.books = n.prototype.regexps.get_books(!1, "none");
  var oa;
  (function (k) {
    function a(d, c, f, g) {
      this.message = d;
      this.expected = c;
      this.found = f;
      this.location = g;
      this.name = "SyntaxError";
      "function" === typeof Error.captureStackTrace &&
        Error.captureStackTrace(this, a);
    }
    (function (a, c) {
      function d() {
        this.constructor = a;
      }
      d.prototype = c.prototype;
      a.prototype = new d();
    })(a, Error);
    a.buildMessage = function (a, c) {
      function d(a) {
        return a.charCodeAt(0).toString(16).toUpperCase();
      }
      function g(a) {
        return a
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\0/g, "\\0")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/[\x00-\x0F]/g, function (a) {
            return "\\x0" + d(a);
          })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function (a) {
            return "\\x" + d(a);
          });
      }
      function l(a) {
        return a
          .replace(/\\/g, "\\\\")
          .replace(/\]/g, "\\]")
          .replace(/\^/g, "\\^")
          .replace(/-/g, "\\-")
          .replace(/\0/g, "\\0")
          .replace(/\t/g, "\\t")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/[\x00-\x0F]/g, function (a) {
            return "\\x0" + d(a);
          })
          .replace(/[\x10-\x1F\x7F-\x9F]/g, function (a) {
            return "\\x" + d(a);
          });
      }
      var k = {
        literal: function (a) {
          return '"' + g(a.text) + '"';
        },
        class: function (a) {
          var d = "",
            c;
          for (c = 0; c < a.parts.length; c++)
            d +=
              a.parts[c] instanceof Array
                ? l(a.parts[c][0]) + "-" + l(a.parts[c][1])
                : l(a.parts[c]);
          return "[" + (a.inverted ? "^" : "") + d + "]";
        },
        any: function (a) {
          return "any character";
        },
        end: function (a) {
          return "end of input";
        },
        other: function (a) {
          return a.description;
        }
      };
      return (
        "Expected " +
        (function (a) {
          var d = Array(a.length),
            c;
          for (c = 0; c < a.length; c++) {
            var f = c;
            var g = a[c];
            g = k[g.type](g);
            d[f] = g;
          }
          d.sort();
          if (0 < d.length) {
            for (a = c = 1; c < d.length; c++)
              d[c - 1] !== d[c] && ((d[a] = d[c]), a++);
            d.length = a;
          }
          switch (d.length) {
            case 1:
              return d[0];
            case 2:
              return d[0] + " or " + d[1];
            default:
              return d.slice(0, -1).join(", ") + ", or " + d[d.length - 1];
          }
        })(a) +
        " but " +
        (c ? '"' + g(c) + '"' : "end of input") +
        " found."
      );
    };
    oa = {
      SyntaxError: a,
      parse: function (d, c) {
        function f(b, e) {
          return { type: "literal", text: b, ignoreCase: e };
        }
        function g(b, e, a) {
          return { type: "class", parts: b, inverted: e, ignoreCase: a };
        }
        function l(b) {
          var e = pa[b],
            a;
          if (!e) {
            for (a = b - 1; !pa[a]; ) a--;
            e = pa[a];
            for (e = { line: e.line, column: e.column }; a < b; )
              10 === d.charCodeAt(a) ? (e.line++, (e.column = 1)) : e.column++,
                a++;
            pa[b] = e;
          }
          return e;
        }
        function k(b, e) {
          var a = l(b),
            d = l(e);
          return {
            start: { offset: b, line: a.line, column: a.column },
            end: { offset: e, line: d.line, column: d.column }
          };
        }
        function m(b) {
          e < M || (e > M && ((M = e), (Ha = [])), Ha.push(b));
        }
        function n() {
          var e = [];
          var a = qa();
          a === b &&
            ((a = v()),
            a === b &&
              ((a = ra()),
              a === b &&
                ((a = u()),
                a === b &&
                  ((a = ga()),
                  a === b &&
                    ((a = R()),
                    a === b &&
                      ((a = y()),
                      a === b &&
                        ((a = S()),
                        a === b &&
                          ((a = B()),
                          a === b &&
                            ((a = N()),
                            a === b &&
                              ((a = J()),
                              a === b &&
                                ((a = x()),
                                a === b &&
                                  ((a = Z()),
                                  a === b &&
                                    ((a = O()),
                                    a === b &&
                                      ((a = T()),
                                      a === b &&
                                        ((a = z()),
                                        a === b &&
                                          ((a = aa()),
                                          a === b &&
                                            ((a = ba()),
                                            a === b &&
                                              ((a = U()),
                                              a === b &&
                                                ((a = V()),
                                                a === b &&
                                                  ((a = Ta()),
                                                  a === b &&
                                                    ((a = Ua()),
                                                    a === b &&
                                                      ((a = C()),
                                                      a === b &&
                                                        ((a = ha()),
                                                        a === b &&
                                                          ((a = ia()),
                                                          a === b &&
                                                            ((a = W()),
                                                            a === b &&
                                                              ((a = ca()),
                                                              a === b &&
                                                                ((a = K()),
                                                                a === b &&
                                                                  ((a = L()),
                                                                  a === b &&
                                                                    ((a = D()),
                                                                    a === b &&
                                                                      ((a = A()),
                                                                      a === b &&
                                                                        ((a = Va()),
                                                                        a ===
                                                                          b &&
                                                                          ((a = Wa()),
                                                                          a ===
                                                                            b &&
                                                                            (a = Ia())))))))))))))))))))))))))))))))));
          if (a !== b)
            for (; a !== b; )
              e.push(a),
                (a = qa()),
                a === b &&
                  ((a = v()),
                  a === b &&
                    ((a = ra()),
                    a === b &&
                      ((a = u()),
                      a === b &&
                        ((a = ga()),
                        a === b &&
                          ((a = R()),
                          a === b &&
                            ((a = y()),
                            a === b &&
                              ((a = S()),
                              a === b &&
                                ((a = B()),
                                a === b &&
                                  ((a = N()),
                                  a === b &&
                                    ((a = J()),
                                    a === b &&
                                      ((a = x()),
                                      a === b &&
                                        ((a = Z()),
                                        a === b &&
                                          ((a = O()),
                                          a === b &&
                                            ((a = T()),
                                            a === b &&
                                              ((a = z()),
                                              a === b &&
                                                ((a = aa()),
                                                a === b &&
                                                  ((a = ba()),
                                                  a === b &&
                                                    ((a = U()),
                                                    a === b &&
                                                      ((a = V()),
                                                      a === b &&
                                                        ((a = Ta()),
                                                        a === b &&
                                                          ((a = Ua()),
                                                          a === b &&
                                                            ((a = C()),
                                                            a === b &&
                                                              ((a = ha()),
                                                              a === b &&
                                                                ((a = ia()),
                                                                a === b &&
                                                                  ((a = W()),
                                                                  a === b &&
                                                                    ((a = ca()),
                                                                    a === b &&
                                                                      ((a = K()),
                                                                      a === b &&
                                                                        ((a = L()),
                                                                        a ===
                                                                          b &&
                                                                          ((a = D()),
                                                                          a ===
                                                                            b &&
                                                                            ((a = A()),
                                                                            a ===
                                                                              b &&
                                                                              ((a = Va()),
                                                                              a ===
                                                                                b &&
                                                                                ((a = Wa()),
                                                                                a ===
                                                                                  b &&
                                                                                  (a = Ia())))))))))))))))))))))))))))))))));
          else e = b;
          return e;
        }
        function v() {
          var a = e;
          var d = ra();
          d === b &&
            ((d = qa()),
            d === b &&
              ((d = u()),
              d === b &&
                ((d = ga()),
                d === b &&
                  ((d = R()),
                  d === b &&
                    ((d = y()),
                    d === b &&
                      ((d = S()),
                      d === b &&
                        ((d = B()),
                        d === b &&
                          ((d = N()),
                          d === b &&
                            ((d = J()),
                            d === b &&
                              ((d = x()),
                              d === b &&
                                ((d = Z()),
                                d === b &&
                                  ((d = O()),
                                  d === b &&
                                    ((d = T()),
                                    d === b &&
                                      ((d = z()),
                                      d === b &&
                                        ((d = aa()),
                                        d === b &&
                                          ((d = ba()),
                                          d === b &&
                                            ((d = U()),
                                            d === b &&
                                              ((d = V()),
                                              d === b &&
                                                (d = Ia())))))))))))))))))));
          if (d !== b) {
            var c = [];
            var h = e;
            var f = C();
            f === b && (f = null);
            if (f !== b) {
              var g = t();
              g !== b ? (h = f = [f, g]) : ((e = h), (h = b));
            } else (e = h), (h = b);
            if (h !== b)
              for (; h !== b; )
                c.push(h),
                  (h = e),
                  (f = C()),
                  f === b && (f = null),
                  f !== b
                    ? ((g = t()),
                      g !== b ? (h = f = [f, g]) : ((e = h), (h = b)))
                    : ((e = h), (h = b));
            else c = b;
            c !== b
              ? ((q = a),
                (a = c),
                a.unshift([d]),
                (a = d = { type: "sequence", value: a, indices: [q, e - 1] }))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function t() {
          var a = e;
          if (40 === d.charCodeAt(e)) {
            var c = Ga;
            e++;
          } else (c = b), 0 === p && m(ac);
          if (c !== b)
            if (((c = w()), c !== b))
              if (((c = C()), c === b && (c = null), c !== b))
                if (((c = t()), c !== b)) {
                  var f = [];
                  var h = e;
                  var r = C();
                  r === b && (r = null);
                  if (r !== b) {
                    var g = t();
                    g !== b ? (h = r = [r, g]) : ((e = h), (h = b));
                  } else (e = h), (h = b);
                  for (; h !== b; )
                    f.push(h),
                      (h = e),
                      (r = C()),
                      r === b && (r = null),
                      r !== b
                        ? ((g = t()),
                          g !== b ? (h = r = [r, g]) : ((e = h), (h = b)))
                        : ((e = h), (h = b));
                  f !== b
                    ? ((h = w()),
                      h !== b
                        ? (41 === d.charCodeAt(e)
                            ? ((r = bc), e++)
                            : ((r = b), 0 === p && m(cc)),
                          r !== b
                            ? ((q = a),
                              (a = f),
                              "undefined" === typeof a && (a = []),
                              a.unshift([c]),
                              (a = c = {
                                type: "sequence_post_enclosed",
                                value: a,
                                indices: [q, e - 1]
                              }))
                            : ((e = a), (a = b)))
                        : ((e = a), (a = b)))
                    : ((e = a), (a = b));
                } else (e = a), (a = b);
              else (e = a), (a = b);
            else (e = a), (a = b);
          else (e = a), (a = b);
          a === b &&
            ((a = ra()),
            a === b &&
              ((a = qa()),
              a === b &&
                ((a = u()),
                a === b &&
                  ((a = ga()),
                  a === b &&
                    ((a = R()),
                    a === b &&
                      ((a = y()),
                      a === b &&
                        ((a = S()),
                        a === b &&
                          ((a = B()),
                          a === b &&
                            ((a = N()),
                            a === b &&
                              ((a = J()),
                              a === b &&
                                ((a = x()),
                                a === b &&
                                  ((a = Z()),
                                  a === b &&
                                    ((a = O()),
                                    a === b &&
                                      ((a = T()),
                                      a === b &&
                                        ((a = z()),
                                        a === b &&
                                          ((a = aa()),
                                          a === b &&
                                            ((a = ba()),
                                            a === b &&
                                              ((a = U()),
                                              a === b &&
                                                ((a = V()),
                                                a === b &&
                                                  ((a = ha()),
                                                  a === b &&
                                                    ((a = ia()),
                                                    a === b &&
                                                      ((a = W()),
                                                      a === b &&
                                                        ((a = ca()),
                                                        a === b &&
                                                          ((a = K()),
                                                          a === b &&
                                                            ((a = L()),
                                                            a === b &&
                                                              ((a = D()),
                                                              a === b &&
                                                                (a = A())))))))))))))))))))))))))));
          return a;
        }
        function u() {
          var a = e;
          var d = R();
          if (
            d === b &&
            ((d = y()),
            d === b &&
              ((d = S()),
              d === b &&
                ((d = B()),
                d === b &&
                  ((d = N()),
                  d === b &&
                    ((d = J()),
                    d === b &&
                      ((d = x()),
                      d === b &&
                        ((d = Z()), d === b && ((d = O()), d === b))))))))
          ) {
            d = e;
            var c = z();
            if (c !== b) {
              var h = e;
              p++;
              var f = e;
              var g = X();
              if (g !== b) {
                var m = R();
                m === b &&
                  ((m = y()),
                  m === b &&
                    ((m = S()),
                    m === b &&
                      ((m = B()),
                      m === b &&
                        ((m = N()),
                        m === b &&
                          ((m = J()),
                          m === b &&
                            ((m = x()),
                            m === b && ((m = O()), m === b && (m = z()))))))));
                m !== b ? (f = g = [g, m]) : ((e = f), (f = b));
              } else (e = f), (f = b);
              p--;
              f !== b ? ((e = h), (h = void 0)) : (h = b);
              h !== b ? (d = c = [c, h]) : ((e = d), (d = b));
            } else (e = d), (d = b);
            d === b &&
              ((d = aa()),
              d === b &&
                ((d = ba()),
                d === b &&
                  ((d = T()),
                  d === b &&
                    ((d = U()),
                    d === b &&
                      ((d = V()),
                      d === b &&
                        ((d = ha()),
                        d === b &&
                          ((d = ia()),
                          d === b &&
                            ((d = W()),
                            d === b &&
                              ((d = ca()),
                              d === b &&
                                ((d = K()),
                                d === b &&
                                  ((d = L()),
                                  d === b &&
                                    ((d = D()),
                                    d === b && (d = A())))))))))))));
          }
          d !== b
            ? ((c = X()),
              c !== b
                ? ((h = ga()),
                  h === b &&
                    ((h = R()),
                    h === b &&
                      ((h = y()),
                      h === b &&
                        ((h = S()),
                        h === b &&
                          ((h = B()),
                          h === b &&
                            ((h = N()),
                            h === b &&
                              ((h = J()),
                              h === b &&
                                ((h = x()),
                                h === b &&
                                  ((h = Z()),
                                  h === b &&
                                    ((h = O()),
                                    h === b &&
                                      ((h = z()),
                                      h === b &&
                                        ((h = aa()),
                                        h === b &&
                                          ((h = ba()),
                                          h === b &&
                                            ((h = T()),
                                            h === b &&
                                              ((h = U()),
                                              h === b &&
                                                ((h = V()),
                                                h === b &&
                                                  ((h = ha()),
                                                  h === b &&
                                                    ((h = ia()),
                                                    h === b &&
                                                      ((h = W()),
                                                      h === b &&
                                                        ((h = K()),
                                                        h === b &&
                                                          ((h = L()),
                                                          h === b &&
                                                            ((h = ca()),
                                                            h === b &&
                                                              ((h = D()),
                                                              h === b &&
                                                                (h = A()))))))))))))))))))))))),
                  h !== b
                    ? ((q = a),
                      (a = d),
                      a.length && 2 === a.length && (a = a[0]),
                      (a = d = {
                        type: "range",
                        value: [a, h],
                        indices: [q, e - 1]
                      }))
                    : ((e = a), (a = b)))
                : ((e = a), (a = b)))
            : ((e = a), (a = b));
          return a;
        }
        function z() {
          var a = e;
          if (31 === d.charCodeAt(e)) {
            var c = ja;
            e++;
          } else (c = b), 0 === p && m(ka);
          if (c !== b)
            if (((c = la()), c !== b)) {
              var f = e;
              if (47 === d.charCodeAt(e)) {
                var h = dc;
                e++;
              } else (h = b), 0 === p && m(ec);
              if (h !== b) {
                if (fc.test(d.charAt(e))) {
                  var r = d.charAt(e);
                  e++;
                } else (r = b), 0 === p && m(gc);
                r !== b ? (f = h = [h, r]) : ((e = f), (f = b));
              } else (e = f), (f = b);
              f === b && (f = null);
              f !== b
                ? (31 === d.charCodeAt(e)
                    ? ((h = ja), e++)
                    : ((h = b), 0 === p && m(ka)),
                  h !== b ? ((q = a), (a = c = Xa(c))) : ((e = a), (a = b)))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function x() {
          var a = e;
          var d = z();
          if (d !== b) {
            var c = e;
            var h = I();
            if (h !== b) {
              var f = e;
              p++;
              var g = e;
              var m = D();
              if (m !== b) {
                var k = H();
                if (k !== b) {
                  var l = A();
                  l !== b ? (g = m = [m, k, l]) : ((e = g), (g = b));
                } else (e = g), (g = b);
              } else (e = g), (g = b);
              p--;
              g !== b ? ((e = f), (f = void 0)) : (f = b);
              f !== b ? (c = h = [h, f]) : ((e = c), (c = b));
            } else (e = c), (c = b);
            if (c === b) {
              c = [];
              h = H();
              if (h !== b) for (; h !== b; ) c.push(h), (h = H());
              else c = b;
              if (c === b) {
                c = [];
                h = da();
                if (h !== b) for (; h !== b; ) c.push(h), (h = da());
                else c = b;
                if (c === b) {
                  c = [];
                  h = X();
                  if (h !== b) for (; h !== b; ) c.push(h), (h = X());
                  else c = b;
                  c === b && (c = w());
                }
              }
            }
            c !== b
              ? ((h = D()),
                h !== b ? ((q = a), (a = d = Ya(d, h))) : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function y() {
          var a = e;
          var d = J();
          d === b && (d = x());
          if (d !== b) {
            var c = Ja();
            c !== b
              ? ((q = a),
                (a = d = {
                  type: "bc_title",
                  value: [d, c],
                  indices: [q, e - 1]
                }))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function B() {
          var a = e;
          var c = J();
          c === b && (c = x());
          if (c !== b) {
            var f = e;
            p++;
            var h = e;
            if (46 === d.charCodeAt(e)) {
              var r = F;
              e++;
            } else (r = b), 0 === p && m(G);
            if (r !== b) {
              var g = I();
              if (g !== b) {
                var k = A();
                k !== b ? (h = r = [r, g, k]) : ((e = h), (h = b));
              } else (e = h), (h = b);
            } else (e = h), (h = b);
            h === b &&
              ((h = e),
              (r = C()),
              r === b && (r = null),
              r !== b
                ? ((g = I()),
                  g !== b
                    ? ((k = W()),
                      k !== b ? (h = r = [r, g, k]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)))
                : ((e = h), (h = b)));
            p--;
            h === b ? (f = void 0) : ((e = f), (f = b));
            f !== b
              ? ((h = e),
                (r = H()),
                r === b && (r = C()),
                r === b && (r = null),
                r !== b
                  ? ((g = I()), g !== b ? (h = r = [r, g]) : ((e = h), (h = b)))
                  : ((e = h), (h = b)),
                h === b && (h = H()),
                h !== b
                  ? ((r = K()),
                    r === b && (r = A()),
                    r !== b
                      ? ((q = a), (a = c = ma(c, r)))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function N() {
          var a = e;
          var d = J();
          d === b && (d = x());
          if (d !== b) {
            var c = da();
            if (c !== b)
              if (((c = K()), c === b && (c = A()), c !== b)) {
                var h = e;
                p++;
                var f = e;
                var g = H();
                if (g !== b) {
                  var m = A();
                  m !== b ? (f = g = [g, m]) : ((e = f), (f = b));
                } else (e = f), (f = b);
                p--;
                f === b ? (h = void 0) : ((e = h), (h = b));
                h !== b ? ((q = a), (a = d = ma(d, c))) : ((e = a), (a = b));
              } else (e = a), (a = b);
            else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function R() {
          var a;
          var c = (a = e);
          var f = z();
          if (f !== b) {
            var h = w();
            h !== b
              ? (44 === d.charCodeAt(e)
                  ? ((h = sa), e++)
                  : ((h = b), 0 === p && m(ta)),
                h !== b
                  ? ((h = w()),
                    h !== b
                      ? ((h = D()),
                        h !== b
                          ? ((q = c), (c = f = Ya(f, h)))
                          : ((e = c), (c = b)))
                      : ((e = c), (c = b)))
                  : ((e = c), (c = b)))
              : ((e = c), (c = b));
          } else (e = c), (c = b);
          if (c !== b)
            if (((f = w()), f !== b))
              if (
                (44 === d.charCodeAt(e)
                  ? ((f = sa), e++)
                  : ((f = b), 0 === p && m(ta)),
                f !== b)
              )
                if (((f = w()), f !== b))
                  if (((f = K()), f === b && (f = A()), f !== b)) {
                    h = e;
                    p++;
                    var r = e;
                    var g = H();
                    if (g !== b) {
                      var k = A();
                      k !== b ? (r = g = [g, k]) : ((e = r), (r = b));
                    } else (e = r), (r = b);
                    p--;
                    r === b ? (h = void 0) : ((e = h), (h = b));
                    h !== b
                      ? ((q = a), (a = c = ma(c, f)))
                      : ((e = a), (a = b));
                  } else (e = a), (a = b);
                else (e = a), (a = b);
              else (e = a), (a = b);
            else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function qa() {
          var a = e;
          var c = z();
          if (c !== b) {
            if (45 === d.charCodeAt(e)) {
              var f = Ka;
              e++;
            } else (f = b), 0 === p && m(La);
            f === b && (f = Y());
            f === b && (f = null);
            if (f !== b)
              if (((f = D()), f !== b)) {
                if (45 === d.charCodeAt(e)) {
                  var h = Ka;
                  e++;
                } else (h = b), 0 === p && m(La);
                if (h !== b)
                  if (((h = A()), h !== b)) {
                    if (45 === d.charCodeAt(e)) {
                      var r = Ka;
                      e++;
                    } else (r = b), 0 === p && m(La);
                    r !== b
                      ? ((r = A()),
                        r !== b
                          ? ((q = a),
                            (a = c = {
                              type: "range",
                              value: [
                                {
                                  type: "bcv",
                                  value: [
                                    {
                                      type: "bc",
                                      value: [c, f],
                                      indices: [c.indices[0], f.indices[1]]
                                    },
                                    h
                                  ],
                                  indices: [c.indices[0], h.indices[1]]
                                },
                                r
                              ],
                              indices: [q, e - 1]
                            }))
                          : ((e = a), (a = b)))
                      : ((e = a), (a = b));
                  } else (e = a), (a = b);
                else (e = a), (a = b);
              } else (e = a), (a = b);
            else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function O() {
          var a = e;
          var d = z();
          if (d !== b) {
            var c = [];
            var h = H();
            if (h !== b) for (; h !== b; ) c.push(h), (h = H());
            else c = b;
            if (c === b) {
              c = [];
              h = da();
              if (h !== b) for (; h !== b; ) c.push(h), (h = da());
              else c = b;
              if (c === b) {
                c = [];
                h = X();
                if (h !== b) for (; h !== b; ) c.push(h), (h = X());
                else c = b;
                if (c === b) {
                  c = e;
                  h = [];
                  var f = C();
                  if (f !== b) for (; f !== b; ) h.push(f), (f = C());
                  else h = b;
                  if (h !== b) {
                    f = e;
                    p++;
                    var g = I();
                    p--;
                    g !== b ? ((e = f), (f = void 0)) : (f = b);
                    f !== b ? (c = h = [h, f]) : ((e = c), (c = b));
                  } else (e = c), (c = b);
                  c === b && (c = w());
                }
              }
            }
            c !== b
              ? ((h = K()),
                h === b && (h = A()),
                h !== b
                  ? ((q = a),
                    (a = d = {
                      type: "bv",
                      value: [d, h],
                      indices: [q, e - 1]
                    }))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function U() {
          var a = e;
          var d = na();
          if (d !== b)
            if (((d = D()), d !== b)) {
              var c = Ma();
              c === b && (c = null);
              c !== b
                ? ((c = z()),
                  c !== b ? ((q = a), (a = d = Za(d, c))) : ((e = a), (a = b)))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function ra() {
          var a = e;
          var d = na();
          if (d !== b)
            if (((d = D()), d !== b)) {
              var c = X();
              if (c !== b)
                if (((c = D()), c !== b)) {
                  var h = Ma();
                  h === b && (h = null);
                  h !== b
                    ? ((h = z()),
                      h !== b
                        ? ((q = a),
                          (a = d = {
                            type: "cb_range",
                            value: [h, d, c],
                            indices: [q, e - 1]
                          }))
                        : ((e = a), (a = b)))
                    : ((e = a), (a = b));
                } else (e = a), (a = b);
              else (e = a), (a = b);
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function aa() {
          var a = e;
          var d = U();
          if (d !== b) {
            var c = C();
            c === b && (c = null);
            c !== b
              ? ((c = I()),
                c !== b
                  ? ((c = A()),
                    c !== b
                      ? ((q = a), (a = d = ma(d, c)))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function V() {
          var a = e;
          var c = D();
          if (c !== b) {
            if (d.substr(e, 2) === $a) {
              var f = $a;
              e += 2;
            } else (f = b), 0 === p && m(hc);
            f === b &&
              (d.substr(e, 2) === ab
                ? ((f = ab), (e += 2))
                : ((f = b), 0 === p && m(ic)),
              f === b &&
                (d.substr(e, 2) === bb
                  ? ((f = bb), (e += 2))
                  : ((f = b), 0 === p && m(jc))));
            f !== b
              ? ((f = na()),
                f !== b
                  ? ((f = Ma()),
                    f === b && (f = null),
                    f !== b
                      ? ((f = z()),
                        f !== b
                          ? ((q = a), (a = c = Za(c, f)))
                          : ((e = a), (a = b)))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function ba() {
          var a = e;
          var d = V();
          if (d !== b) {
            var c = C();
            c === b && (c = null);
            c !== b
              ? ((c = I()),
                c !== b
                  ? ((c = A()),
                    c !== b
                      ? ((q = a), (a = d = ma(d, c)))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function T() {
          var a = e;
          if (31 === d.charCodeAt(e)) {
            var c = ja;
            e++;
          } else (c = b), 0 === p && m(ka);
          if (c !== b)
            if (((c = la()), c !== b)) {
              if (d.substr(e, 3) === cb) {
                var f = cb;
                e += 3;
              } else (f = b), 0 === p && m(kc);
              f !== b
                ? ((q = a),
                  (a = c = {
                    type: "c_psalm",
                    value: c.value,
                    indices: [q, e - 1]
                  }))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function Z() {
          var a = e;
          var d = T();
          if (d !== b) {
            var c = C();
            c === b && (c = null);
            c !== b
              ? ((c = I()),
                c !== b
                  ? ((c = A()),
                    c !== b
                      ? ((q = a),
                        (a = d = {
                          type: "cv_psalm",
                          value: [d, c],
                          indices: [q, e - 1]
                        }))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function ha() {
          var a = e;
          var d = na();
          if (d !== b)
            if (((d = D()), d !== b)) {
              var c = Ja();
              c !== b
                ? ((q = a),
                  (a = d = {
                    type: "c_title",
                    value: [d, c],
                    indices: [q, e - 1]
                  }))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function W() {
          var a = e;
          var c = I();
          c === b && (c = null);
          if (c !== b)
            if (((c = D()), c !== b)) {
              var f = e;
              p++;
              var h = e;
              if (46 === d.charCodeAt(e)) {
                var r = F;
                e++;
              } else (r = b), 0 === p && m(G);
              if (r !== b) {
                var g = I();
                if (g !== b) {
                  var k = A();
                  k !== b ? (h = r = [r, g, k]) : ((e = h), (h = b));
                } else (e = h), (h = b);
              } else (e = h), (h = b);
              p--;
              h === b ? (f = void 0) : ((e = f), (f = b));
              f !== b
                ? ((h = e),
                  (r = H()),
                  r === b && (r = null),
                  r !== b
                    ? ((g = I()),
                      g !== b ? (h = r = [r, g]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)),
                  h === b && (h = H()),
                  h !== b
                    ? ((r = K()),
                      r === b && (r = A()),
                      r !== b
                        ? ((q = a), (a = c = db(c, r)))
                        : ((e = a), (a = b)))
                    : ((e = a), (a = b)))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function ca() {
          var a = e;
          var d = D();
          if (d !== b) {
            var c = da();
            if (c !== b)
              if (((c = K()), c === b && (c = A()), c !== b)) {
                var f = e;
                p++;
                var g = e;
                var m = H();
                if (m !== b) {
                  var k = A();
                  k !== b ? (g = m = [m, k]) : ((e = g), (g = b));
                } else (e = g), (g = b);
                p--;
                g === b ? (f = void 0) : ((e = f), (f = b));
                f !== b ? ((q = a), (a = d = db(d, c))) : ((e = a), (a = b));
              } else (e = a), (a = b);
            else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function D() {
          var a = e;
          var d = na();
          d === b && (d = null);
          d !== b
            ? ((d = L()),
              d !== b
                ? ((q = a),
                  (a = d = { type: "c", value: [d], indices: [q, e - 1] }))
                : ((e = a), (a = b)))
            : ((e = a), (a = b));
          return a;
        }
        function ga() {
          var a = e;
          var c = B();
          c === b &&
            ((c = N()),
            c === b &&
              ((c = x()),
              c === b &&
                ((c = O()),
                c === b &&
                  ((c = W()),
                  c === b &&
                    ((c = ca()),
                    c === b &&
                      ((c = L()),
                      c === b && ((c = D()), c === b && (c = A()))))))));
          if (c !== b) {
            var f = w();
            if (f !== b) {
              f = e;
              if (d.substr(e, 2) === ua) {
                var h = ua;
                e += 2;
              } else (h = b), 0 === p && m(eb);
              if (h !== b) {
                var g = e;
                p++;
                if (va.test(d.charAt(e))) {
                  var k = d.charAt(e);
                  e++;
                } else (k = b), 0 === p && m(wa);
                p--;
                k === b ? (g = void 0) : ((e = g), (g = b));
                g !== b ? (f = h = [h, g]) : ((e = f), (f = b));
              } else (e = f), (f = b);
              f === b &&
                ((f = e),
                102 === d.charCodeAt(e)
                  ? ((h = fb), e++)
                  : ((h = b), 0 === p && m(gb)),
                h !== b
                  ? ((g = e),
                    p++,
                    va.test(d.charAt(e))
                      ? ((k = d.charAt(e)), e++)
                      : ((k = b), 0 === p && m(wa)),
                    p--,
                    k === b ? (g = void 0) : ((e = g), (g = b)),
                    g !== b ? (f = h = [h, g]) : ((e = f), (f = b)))
                  : ((e = f), (f = b)));
              f !== b
                ? ((h = E()),
                  h === b && (h = null),
                  h !== b
                    ? ((g = e),
                      p++,
                      Na.test(d.charAt(e))
                        ? ((k = d.charAt(e)), e++)
                        : ((k = b), 0 === p && m(Oa)),
                      p--,
                      k === b ? (g = void 0) : ((e = g), (g = b)),
                      g !== b
                        ? ((q = a),
                          (a = c = {
                            type: "ff",
                            value: [c],
                            indices: [q, e - 1]
                          }))
                        : ((e = a), (a = b)))
                    : ((e = a), (a = b)))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function ia() {
          var a = e;
          var d = L();
          if (d !== b) {
            var c = Ja();
            c !== b
              ? ((q = a),
                (a = d = {
                  type: "integer_title",
                  value: [d, c],
                  indices: [q, e - 1]
                }))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function Ia() {
          var a = e;
          if (31 === d.charCodeAt(e)) {
            var c = ja;
            e++;
          } else (c = b), 0 === p && m(ka);
          if (c !== b)
            if (((c = la()), c !== b)) {
              if (d.substr(e, 3) === hb) {
                var f = hb;
                e += 3;
              } else (f = b), 0 === p && m(lc);
              f !== b
                ? ((q = a),
                  (a = c = {
                    type: "context",
                    value: c.value,
                    indices: [q, e - 1]
                  }))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function J() {
          var a;
          var c = (a = e);
          if (31 === d.charCodeAt(e)) {
            var f = ja;
            e++;
          } else (f = b), 0 === p && m(ka);
          if (f !== b)
            if (((f = la()), f !== b)) {
              if (d.substr(e, 3) === ib) {
                var h = ib;
                e += 3;
              } else (h = b), 0 === p && m(mc);
              h !== b ? ((q = c), (c = f = Xa(f))) : ((e = c), (c = b));
            } else (e = c), (c = b);
          else (e = c), (c = b);
          c !== b
            ? (d.substr(e, 2) === jb
                ? ((f = jb), (e += 2))
                : ((f = b), 0 === p && m(nc)),
              f !== b
                ? ((f = e),
                  p++,
                  Pa.test(d.charAt(e))
                    ? ((h = d.charAt(e)), e++)
                    : ((h = b), 0 === p && m(Qa)),
                  p--,
                  h === b ? (f = void 0) : ((e = f), (f = b)),
                  f !== b
                    ? ((q = a),
                      (a = c = {
                        type: "bc",
                        value: [
                          c,
                          {
                            type: "c",
                            value: [
                              {
                                type: "integer",
                                value: 151,
                                indices: [e - 2, e - 1]
                              }
                            ],
                            indices: [e - 2, e - 1]
                          }
                        ],
                        indices: [q, e - 1]
                      }))
                    : ((e = a), (a = b)))
                : ((e = a), (a = b)))
            : ((e = a), (a = b));
          return a;
        }
        function S() {
          var a = e;
          var c = J();
          if (c !== b) {
            if (46 === d.charCodeAt(e)) {
              var f = F;
              e++;
            } else (f = b), 0 === p && m(G);
            f !== b
              ? ((f = L()),
                f !== b
                  ? ((q = a),
                    (a = c = {
                      type: "bcv",
                      value: [
                        c,
                        {
                          type: "v",
                          value: [f],
                          indices: [f.indices[0], f.indices[1]]
                        }
                      ],
                      indices: [q, e - 1]
                    }))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function K() {
          var a = e;
          var c = I();
          c === b && (c = null);
          if (c !== b)
            if (((c = L()), c !== b)) {
              var f = w();
              if (f !== b) {
                f = e;
                p++;
                var h = e;
                if (d.substr(e, 2) === ua) {
                  var g = ua;
                  e += 2;
                } else (g = b), 0 === p && m(eb);
                if (g !== b) {
                  var k = e;
                  p++;
                  if (va.test(d.charAt(e))) {
                    var l = d.charAt(e);
                    e++;
                  } else (l = b), 0 === p && m(wa);
                  p--;
                  l === b ? (k = void 0) : ((e = k), (k = b));
                  k !== b ? (h = g = [g, k]) : ((e = h), (h = b));
                } else (e = h), (h = b);
                h === b &&
                  ((h = e),
                  102 === d.charCodeAt(e)
                    ? ((g = fb), e++)
                    : ((g = b), 0 === p && m(gb)),
                  g !== b
                    ? ((k = e),
                      p++,
                      va.test(d.charAt(e))
                        ? ((l = d.charAt(e)), e++)
                        : ((l = b), 0 === p && m(wa)),
                      p--,
                      l === b ? (k = void 0) : ((e = k), (k = b)),
                      k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)));
                p--;
                h === b ? (f = void 0) : ((e = f), (f = b));
                f !== b
                  ? (oc.test(d.charAt(e))
                      ? ((h = d.charAt(e)), e++)
                      : ((h = b), 0 === p && m(pc)),
                    h !== b
                      ? ((g = e),
                        p++,
                        Na.test(d.charAt(e))
                          ? ((k = d.charAt(e)), e++)
                          : ((k = b), 0 === p && m(Oa)),
                        p--,
                        k === b ? (g = void 0) : ((e = g), (g = b)),
                        g !== b
                          ? ((q = a), (a = c = kb(c)))
                          : ((e = a), (a = b)))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b));
              } else (e = a), (a = b);
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function A() {
          var a = e;
          var d = I();
          d === b && (d = null);
          d !== b
            ? ((d = L()),
              d !== b ? ((q = a), (a = d = kb(d))) : ((e = a), (a = b)))
            : ((e = a), (a = b));
          return a;
        }
        function na() {
          var a = e;
          var c = w();
          if (c !== b) {
            c = e;
            if (d.substr(e, 2) === lb) {
              var f = lb;
              e += 2;
            } else (f = b), 0 === p && m(qc);
            if (f !== b) {
              if (d.substr(e, 6) === mb) {
                var h = mb;
                e += 6;
              } else (h = b), 0 === p && m(rc);
              if (
                h === b &&
                (d.substr(e, 5) === nb
                  ? ((h = nb), (e += 5))
                  : ((h = b), 0 === p && m(sc)),
                h === b)
              ) {
                h = e;
                if (d.substr(e, 4) === ob) {
                  var g = ob;
                  e += 4;
                } else (g = b), 0 === p && m(tc);
                if (g !== b) {
                  var k = E();
                  k === b && (k = null);
                  k !== b ? (h = g = [g, k]) : ((e = h), (h = b));
                } else (e = h), (h = b);
                h === b &&
                  ((h = e),
                  d.substr(e, 3) === pb
                    ? ((g = pb), (e += 3))
                    : ((g = b), 0 === p && m(uc)),
                  g !== b
                    ? ((k = E()),
                      k === b && (k = null),
                      k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)),
                  h === b &&
                    ((h = e),
                    d.substr(e, 3) === qb
                      ? ((g = qb), (e += 3))
                      : ((g = b), 0 === p && m(vc)),
                    g !== b
                      ? ((k = E()),
                        k === b && (k = null),
                        k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                      : ((e = h), (h = b)),
                    h === b &&
                      ((h = e),
                      d.substr(e, 3) === rb
                        ? ((g = rb), (e += 3))
                        : ((g = b), 0 === p && m(wc)),
                      g !== b
                        ? ((k = E()),
                          k === b && (k = null),
                          k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                        : ((e = h), (h = b)),
                      h === b &&
                        ((h = e),
                        d.substr(e, 2) === sb
                          ? ((g = sb), (e += 2))
                          : ((g = b), 0 === p && m(xc)),
                        g !== b
                          ? ((k = E()),
                            k === b && (k = null),
                            k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                          : ((e = h), (h = b)),
                        h === b &&
                          ((h = e),
                          112 === d.charCodeAt(e)
                            ? ((g = yc), e++)
                            : ((g = b), 0 === p && m(zc)),
                          g !== b
                            ? ((k = E()),
                              k === b && (k = null),
                              k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                            : ((e = h), (h = b)),
                          h === b &&
                            ((h = e),
                            115 === d.charCodeAt(e)
                              ? ((g = tb), e++)
                              : ((g = b), 0 === p && m(ub)),
                            g !== b
                              ? ((k = E()),
                                k === b && (k = null),
                                k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                              : ((e = h), (h = b)),
                            h === b &&
                              ((h = e),
                              97 === d.charCodeAt(e)
                                ? ((g = Ac), e++)
                                : ((g = b), 0 === p && m(Bc)),
                              g !== b
                                ? ((k = E()),
                                  k === b && (k = null),
                                  k !== b
                                    ? (h = g = [g, k])
                                    : ((e = h), (h = b)))
                                : ((e = h), (h = b)),
                              h === b &&
                                ((h = E()), h === b && (h = null)))))))));
              }
              h !== b ? (c = f = [f, h]) : ((e = c), (c = b));
            } else (e = c), (c = b);
            c !== b
              ? ((f = w()),
                f !== b
                  ? ((q = a), (a = c = { type: "c_explicit" }))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function I() {
          var a = e;
          var c = w();
          if (c !== b) {
            c = e;
            if (118 === d.charCodeAt(e)) {
              var f = vb;
              e++;
            } else (f = b), 0 === p && m(wb);
            if (f !== b) {
              if (d.substr(e, 5) === xb) {
                var h = xb;
                e += 5;
              } else (h = b), 0 === p && m(Cc);
              if (
                h === b &&
                (d.substr(e, 4) === yb
                  ? ((h = yb), (e += 4))
                  : ((h = b), 0 === p && m(Dc)),
                h === b)
              ) {
                h = e;
                if (d.substr(e, 2) === zb) {
                  var g = zb;
                  e += 2;
                } else (g = b), 0 === p && m(Ec);
                if (g !== b) {
                  var k = E();
                  k === b && (k = null);
                  k !== b ? (h = g = [g, k]) : ((e = h), (h = b));
                } else (e = h), (h = b);
                h === b &&
                  ((h = e),
                  d.substr(e, 2) === Ab
                    ? ((g = Ab), (e += 2))
                    : ((g = b), 0 === p && m(Fc)),
                  g !== b
                    ? ((k = E()),
                      k === b && (k = null),
                      k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)),
                  h === b &&
                    ((h = e),
                    115 === d.charCodeAt(e)
                      ? ((g = tb), e++)
                      : ((g = b), 0 === p && m(ub)),
                    g !== b
                      ? ((k = E()),
                        k === b && (k = null),
                        k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                      : ((e = h), (h = b)),
                    h === b &&
                      ((h = e),
                      118 === d.charCodeAt(e)
                        ? ((g = vb), e++)
                        : ((g = b), 0 === p && m(wb)),
                      g !== b
                        ? ((k = E()),
                          k === b && (k = null),
                          k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                        : ((e = h), (h = b)),
                      h === b && ((h = E()), h === b && (h = null)))));
              }
              h !== b ? (c = f = [f, h]) : ((e = c), (c = b));
            } else (e = c), (c = b);
            c !== b
              ? ((f = e),
                p++,
                Na.test(d.charAt(e))
                  ? ((h = d.charAt(e)), e++)
                  : ((h = b), 0 === p && m(Oa)),
                p--,
                h === b ? (f = void 0) : ((e = f), (f = b)),
                f !== b
                  ? ((h = w()),
                    h !== b
                      ? ((q = a), (a = c = { type: "v_explicit" }))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function H() {
          var a = e;
          var c = w();
          if (c !== b) {
            var f = [];
            if (58 === d.charCodeAt(e)) {
              var h = Bb;
              e++;
            } else (h = b), 0 === p && m(Cb);
            if (h !== b)
              for (; h !== b; )
                f.push(h),
                  58 === d.charCodeAt(e)
                    ? ((h = Bb), e++)
                    : ((h = b), 0 === p && m(Cb));
            else f = b;
            if (f === b)
              if (
                ((f = e),
                46 === d.charCodeAt(e)
                  ? ((h = F), e++)
                  : ((h = b), 0 === p && m(G)),
                h !== b)
              ) {
                var g = e;
                p++;
                var k = e;
                var l = w();
                if (l !== b) {
                  if (46 === d.charCodeAt(e)) {
                    var n = F;
                    e++;
                  } else (n = b), 0 === p && m(G);
                  if (n !== b) {
                    var q = w();
                    if (q !== b) {
                      if (46 === d.charCodeAt(e)) {
                        var t = F;
                        e++;
                      } else (t = b), 0 === p && m(G);
                      t !== b ? (k = l = [l, n, q, t]) : ((e = k), (k = b));
                    } else (e = k), (k = b);
                  } else (e = k), (k = b);
                } else (e = k), (k = b);
                p--;
                k === b ? (g = void 0) : ((e = g), (g = b));
                g !== b ? (f = h = [h, g]) : ((e = f), (f = b));
              } else (e = f), (f = b);
            f !== b
              ? ((h = w()), h !== b ? (a = c = [c, f, h]) : ((e = a), (a = b)))
              : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function da() {
          var a = e;
          var c = w();
          if (c !== b) {
            if (Gc.test(d.charAt(e))) {
              var f = d.charAt(e);
              e++;
            } else (f = b), 0 === p && m(Hc);
            if (f !== b) {
              var h = w();
              h !== b ? (a = c = [c, f, h]) : ((e = a), (a = b));
            } else (e = a), (a = b);
          } else (e = a), (a = b);
          a === b && (a = Y());
          return a;
        }
        function C() {
          var a = e;
          var c = [];
          if (Ra.test(d.charAt(e))) {
            var f = d.charAt(e);
            e++;
          } else (f = b), 0 === p && m(Db);
          if (f === b) {
            f = e;
            if (46 === d.charCodeAt(e)) {
              var h = F;
              e++;
            } else (h = b), 0 === p && m(G);
            if (h !== b) {
              var g = e;
              p++;
              var k = e;
              var l = w();
              if (l !== b) {
                if (46 === d.charCodeAt(e)) {
                  var n = F;
                  e++;
                } else (n = b), 0 === p && m(G);
                if (n !== b) {
                  var t = w();
                  if (t !== b) {
                    if (46 === d.charCodeAt(e)) {
                      var u = F;
                      e++;
                    } else (u = b), 0 === p && m(G);
                    u !== b ? (k = l = [l, n, t, u]) : ((e = k), (k = b));
                  } else (e = k), (k = b);
                } else (e = k), (k = b);
              } else (e = k), (k = b);
              p--;
              k === b ? (g = void 0) : ((e = g), (g = b));
              g !== b ? (f = h = [h, g]) : ((e = f), (f = b));
            } else (e = f), (f = b);
            f === b &&
              (d.substr(e, 3) === xa
                ? ((f = xa), (e += 3))
                : ((f = b), 0 === p && m(Eb)),
              f === b &&
                (d.substr(e, 7) === ya
                  ? ((f = ya), (e += 7))
                  : ((f = b), 0 === p && m(Fb)),
                f === b &&
                  ((f = e),
                  d.substr(e, 2) === za
                    ? ((h = za), (e += 2))
                    : ((h = b), 0 === p && m(Gb)),
                  h !== b
                    ? ((g = E()),
                      g === b && (g = null),
                      g !== b ? (f = h = [h, g]) : ((e = f), (f = b)))
                    : ((e = f), (f = b)),
                  f === b &&
                    ((f = e),
                    d.substr(e, 3) === P
                      ? ((h = P), (e += 3))
                      : ((h = b), 0 === p && m(Aa)),
                    h !== b
                      ? ((g = Y()),
                        g !== b
                          ? (d.substr(e, 4) === Q
                              ? ((k = Q), (e += 4))
                              : ((k = b), 0 === p && m(Ba)),
                            k !== b ? (f = h = [h, g, k]) : ((e = f), (f = b)))
                          : ((e = f), (f = b)))
                      : ((e = f), (f = b)),
                    f === b &&
                      (d.substr(e, 4) === Q
                        ? ((f = Q), (e += 4))
                        : ((f = b), 0 === p && m(Ba)),
                      f === b &&
                        (d.substr(e, 3) === P
                          ? ((f = P), (e += 3))
                          : ((f = b), 0 === p && m(Aa)),
                        f === b && (f = Y())))))));
          }
          if (f !== b)
            for (; f !== b; )
              c.push(f),
                Ra.test(d.charAt(e))
                  ? ((f = d.charAt(e)), e++)
                  : ((f = b), 0 === p && m(Db)),
                f === b &&
                  ((f = e),
                  46 === d.charCodeAt(e)
                    ? ((h = F), e++)
                    : ((h = b), 0 === p && m(G)),
                  h !== b
                    ? ((g = e),
                      p++,
                      (k = e),
                      (l = w()),
                      l !== b
                        ? (46 === d.charCodeAt(e)
                            ? ((n = F), e++)
                            : ((n = b), 0 === p && m(G)),
                          n !== b
                            ? ((t = w()),
                              t !== b
                                ? (46 === d.charCodeAt(e)
                                    ? ((u = F), e++)
                                    : ((u = b), 0 === p && m(G)),
                                  u !== b
                                    ? (k = l = [l, n, t, u])
                                    : ((e = k), (k = b)))
                                : ((e = k), (k = b)))
                            : ((e = k), (k = b)))
                        : ((e = k), (k = b)),
                      p--,
                      k === b ? (g = void 0) : ((e = g), (g = b)),
                      g !== b ? (f = h = [h, g]) : ((e = f), (f = b)))
                    : ((e = f), (f = b)),
                  f === b &&
                    (d.substr(e, 3) === xa
                      ? ((f = xa), (e += 3))
                      : ((f = b), 0 === p && m(Eb)),
                    f === b &&
                      (d.substr(e, 7) === ya
                        ? ((f = ya), (e += 7))
                        : ((f = b), 0 === p && m(Fb)),
                      f === b &&
                        ((f = e),
                        d.substr(e, 2) === za
                          ? ((h = za), (e += 2))
                          : ((h = b), 0 === p && m(Gb)),
                        h !== b
                          ? ((g = E()),
                            g === b && (g = null),
                            g !== b ? (f = h = [h, g]) : ((e = f), (f = b)))
                          : ((e = f), (f = b)),
                        f === b &&
                          ((f = e),
                          d.substr(e, 3) === P
                            ? ((h = P), (e += 3))
                            : ((h = b), 0 === p && m(Aa)),
                          h !== b
                            ? ((g = Y()),
                              g !== b
                                ? (d.substr(e, 4) === Q
                                    ? ((k = Q), (e += 4))
                                    : ((k = b), 0 === p && m(Ba)),
                                  k !== b
                                    ? (f = h = [h, g, k])
                                    : ((e = f), (f = b)))
                                : ((e = f), (f = b)))
                            : ((e = f), (f = b)),
                          f === b &&
                            (d.substr(e, 4) === Q
                              ? ((f = Q), (e += 4))
                              : ((f = b), 0 === p && m(Ba)),
                            f === b &&
                              (d.substr(e, 3) === P
                                ? ((f = P), (e += 3))
                                : ((f = b), 0 === p && m(Aa)),
                              f === b && (f = Y()))))))));
          else c = b;
          c !== b && ((q = a), (c = ""));
          return c;
        }
        function X() {
          var a = e;
          var c = w();
          if (c !== b) {
            var f = [];
            var h = e;
            if (Hb.test(d.charAt(e))) {
              var g = d.charAt(e);
              e++;
            } else (g = b), 0 === p && m(Ib);
            if (g !== b) {
              var k = w();
              k !== b ? (h = g = [g, k]) : ((e = h), (h = b));
            } else (e = h), (h = b);
            h === b &&
              ((h = e),
              d.substr(e, 7) === Ca
                ? ((g = Ca), (e += 7))
                : ((g = b), 0 === p && m(Jb)),
              g !== b
                ? ((k = w()), k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                : ((e = h), (h = b)),
              h === b &&
                ((h = e),
                d.substr(e, 4) === Da
                  ? ((g = Da), (e += 4))
                  : ((g = b), 0 === p && m(Kb)),
                g !== b
                  ? ((k = w()), k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                  : ((e = h), (h = b)),
                h === b &&
                  ((h = e),
                  d.substr(e, 2) === Ea
                    ? ((g = Ea), (e += 2))
                    : ((g = b), 0 === p && m(Lb)),
                  g !== b
                    ? ((k = w()),
                      k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)))));
            if (h !== b)
              for (; h !== b; )
                f.push(h),
                  (h = e),
                  Hb.test(d.charAt(e))
                    ? ((g = d.charAt(e)), e++)
                    : ((g = b), 0 === p && m(Ib)),
                  g !== b
                    ? ((k = w()),
                      k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                    : ((e = h), (h = b)),
                  h === b &&
                    ((h = e),
                    d.substr(e, 7) === Ca
                      ? ((g = Ca), (e += 7))
                      : ((g = b), 0 === p && m(Jb)),
                    g !== b
                      ? ((k = w()),
                        k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                      : ((e = h), (h = b)),
                    h === b &&
                      ((h = e),
                      d.substr(e, 4) === Da
                        ? ((g = Da), (e += 4))
                        : ((g = b), 0 === p && m(Kb)),
                      g !== b
                        ? ((k = w()),
                          k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                        : ((e = h), (h = b)),
                      h === b &&
                        ((h = e),
                        d.substr(e, 2) === Ea
                          ? ((g = Ea), (e += 2))
                          : ((g = b), 0 === p && m(Lb)),
                        g !== b
                          ? ((k = w()),
                            k !== b ? (h = g = [g, k]) : ((e = h), (h = b)))
                          : ((e = h), (h = b)))));
            else f = b;
            f !== b ? (a = c = [c, f]) : ((e = a), (a = b));
          } else (e = a), (a = b);
          return a;
        }
        function Ja() {
          var a = e;
          var c = H();
          c === b && (c = C());
          c === b && (c = null);
          c !== b
            ? (d.substr(e, 5) === Mb
                ? ((c = Mb), (e += 5))
                : ((c = b), 0 === p && m(Ic)),
              c !== b
                ? ((q = a),
                  (a = c = { type: "title", value: [c], indices: [q, e - 1] }))
                : ((e = a), (a = b)))
            : ((e = a), (a = b));
          return a;
        }
        function Ma() {
          var a = e;
          var c = w();
          if (c !== b) {
            if (d.substr(e, 4) === Nb) {
              var f = Nb;
              e += 4;
            } else (f = b), 0 === p && m(Jc);
            f === b &&
              (d.substr(e, 2) === Fa
                ? ((f = Fa), (e += 2))
                : ((f = b), 0 === p && m(Ob)),
              f === b &&
                (d.substr(e, 2) === Pb
                  ? ((f = Pb), (e += 2))
                  : ((f = b), 0 === p && m(Kc))));
            if (f !== b) {
              var h = w();
              if (h !== b) {
                var g = e;
                if (d.substr(e, 3) === Qb) {
                  var k = Qb;
                  e += 3;
                } else (k = b), 0 === p && m(Lc);
                if (k !== b) {
                  var l = w();
                  if (l !== b) {
                    if (d.substr(e, 4) === Rb) {
                      var n = Rb;
                      e += 4;
                    } else (n = b), 0 === p && m(Mc);
                    if (n !== b) {
                      var q = w();
                      if (q !== b) {
                        if (d.substr(e, 2) === Fa) {
                          var t = Fa;
                          e += 2;
                        } else (t = b), 0 === p && m(Ob);
                        if (t !== b) {
                          var u = w();
                          u !== b
                            ? (g = k = [k, l, n, q, t, u])
                            : ((e = g), (g = b));
                        } else (e = g), (g = b);
                      } else (e = g), (g = b);
                    } else (e = g), (g = b);
                  } else (e = g), (g = b);
                } else (e = g), (g = b);
                g === b && (g = null);
                g !== b ? (a = c = [c, f, h, g]) : ((e = a), (a = b));
              } else (e = a), (a = b);
            } else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function E() {
          var a = e;
          var c = w();
          if (c !== b) {
            if (46 === d.charCodeAt(e)) {
              var f = F;
              e++;
            } else (f = b), 0 === p && m(G);
            if (f !== b) {
              var h = e;
              p++;
              var g = e;
              var k = w();
              if (k !== b) {
                if (46 === d.charCodeAt(e)) {
                  var l = F;
                  e++;
                } else (l = b), 0 === p && m(G);
                if (l !== b) {
                  var n = w();
                  if (n !== b) {
                    if (46 === d.charCodeAt(e)) {
                      var q = F;
                      e++;
                    } else (q = b), 0 === p && m(G);
                    q !== b ? (g = k = [k, l, n, q]) : ((e = g), (g = b));
                  } else (e = g), (g = b);
                } else (e = g), (g = b);
              } else (e = g), (g = b);
              p--;
              g === b ? (h = void 0) : ((e = h), (h = b));
              h !== b ? (a = c = [c, f, h]) : ((e = a), (a = b));
            } else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function oa() {
          var a = e;
          var c = w();
          if (c !== b) {
            if (44 === d.charCodeAt(e)) {
              var f = sa;
              e++;
            } else (f = b), 0 === p && m(ta);
            if (f !== b) {
              var g = w();
              g !== b ? (a = c = [c, f, g]) : ((e = a), (a = b));
            } else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function Ta() {
          var a = e;
          var c = w();
          if (c !== b)
            if (
              (Sb.test(d.charAt(e))
                ? ((c = d.charAt(e)), e++)
                : ((c = b), 0 === p && m(Tb)),
              c !== b)
            )
              if (((c = w()), c !== b)) {
                c = e;
                var f = ea();
                if (f !== b) {
                  var g = [];
                  var k = e;
                  var l = C();
                  if (l !== b) {
                    var n = ea();
                    n !== b ? (k = l = [l, n]) : ((e = k), (k = b));
                  } else (e = k), (k = b);
                  for (; k !== b; )
                    g.push(k),
                      (k = e),
                      (l = C()),
                      l !== b
                        ? ((n = ea()),
                          n !== b ? (k = l = [l, n]) : ((e = k), (k = b)))
                        : ((e = k), (k = b));
                  g !== b ? (c = f = [f, g]) : ((e = c), (c = b));
                } else (e = c), (c = b);
                c !== b
                  ? ((f = w()),
                    f !== b
                      ? (Nc.test(d.charAt(e))
                          ? ((g = d.charAt(e)), e++)
                          : ((g = b), 0 === p && m(Oc)),
                        g !== b
                          ? ((q = a), (a = c = Ub(c)))
                          : ((e = a), (a = b)))
                      : ((e = a), (a = b)))
                  : ((e = a), (a = b));
              } else (e = a), (a = b);
            else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function Ua() {
          var a = e;
          var c = w();
          if (c !== b) {
            var f = e;
            44 === d.charCodeAt(e)
              ? ((c = sa), e++)
              : ((c = b), 0 === p && m(ta));
            if (c !== b) {
              var g = w();
              g !== b ? (f = c = [c, g]) : ((e = f), (f = b));
            } else (e = f), (f = b);
            f === b && (f = null);
            if (f !== b) {
              c = e;
              g = ea();
              if (g !== b) {
                f = [];
                var k = e;
                var l = C();
                if (l !== b) {
                  var n = ea();
                  n !== b ? (k = l = [l, n]) : ((e = k), (k = b));
                } else (e = k), (k = b);
                for (; k !== b; )
                  f.push(k),
                    (k = e),
                    (l = C()),
                    l !== b
                      ? ((n = ea()),
                        n !== b ? (k = l = [l, n]) : ((e = k), (k = b)))
                      : ((e = k), (k = b));
                f !== b ? (c = g = [g, f]) : ((e = c), (c = b));
              } else (e = c), (c = b);
              c !== b ? ((q = a), (a = c = Ub(c))) : ((e = a), (a = b));
            } else (e = a), (a = b);
          } else (e = a), (a = b);
          return a;
        }
        function ea() {
          var a = e;
          if (30 === d.charCodeAt(e)) {
            var c = Vb;
            e++;
          } else (c = b), 0 === p && m(Wb);
          if (c !== b)
            if (((c = la()), c !== b)) {
              if (30 === d.charCodeAt(e)) {
                var f = Vb;
                e++;
              } else (f = b), 0 === p && m(Wb);
              f !== b
                ? ((q = a),
                  (a = c = {
                    type: "translation",
                    value: c.value,
                    indices: [q, e - 1]
                  }))
                : ((e = a), (a = b));
            } else (e = a), (a = b);
          else (e = a), (a = b);
          return a;
        }
        function L() {
          var a;
          return (a = /^[0-9]{1,3}(?!\d|,000)/.exec(d.substr(e)))
            ? ((q = e),
              (e += a[0].length),
              {
                type: "integer",
                value: parseInt(a[0], 10),
                indices: [q, e - 1]
              })
            : b;
        }
        function la() {
          var a = e;
          var c = [];
          if (Pa.test(d.charAt(e))) {
            var f = d.charAt(e);
            e++;
          } else (f = b), 0 === p && m(Qa);
          if (f !== b)
            for (; f !== b; )
              c.push(f),
                Pa.test(d.charAt(e))
                  ? ((f = d.charAt(e)), e++)
                  : ((f = b), 0 === p && m(Qa));
          else c = b;
          c !== b &&
            ((q = a),
            (c = {
              type: "integer",
              value: parseInt(c.join(""), 10),
              indices: [q, e - 1]
            }));
          return c;
        }
        function Va() {
          var a = e;
          var c = [];
          if (Xb.test(d.charAt(e))) {
            var f = d.charAt(e);
            e++;
          } else (f = b), 0 === p && m(Yb);
          if (f !== b)
            for (; f !== b; )
              c.push(f),
                Xb.test(d.charAt(e))
                  ? ((f = d.charAt(e)), e++)
                  : ((f = b), 0 === p && m(Yb));
          else c = b;
          c !== b &&
            ((q = a),
            (c = { type: "word", value: c.join(""), indices: [q, e - 1] }));
          return c;
        }
        function Wa() {
          var a = e;
          if (Sb.test(d.charAt(e))) {
            var c = d.charAt(e);
            e++;
          } else (c = b), 0 === p && m(Tb);
          c !== b &&
            ((q = a), (c = { type: "stop", value: c, indices: [q, e - 1] }));
          return c;
        }
        function w() {
          var a = Y();
          a === b && (a = null);
          return a;
        }
        function Y() {
          var a;
          return (a = /^[\s\xa0*]+/.exec(d.substr(e)))
            ? ((e += a[0].length), [])
            : b;
        }
        c = void 0 !== c ? c : {};
        var b = {},
          Zb = { start: n },
          $b = n,
          Ga = "(",
          ac = f("(", !1),
          bc = ")",
          cc = f(")", !1),
          ja = "\u001f",
          ka = f("\u001f", !1),
          dc = "/",
          ec = f("/", !1),
          fc = /^[1-8]/,
          gc = g([["1", "8"]], !1, !1),
          Xa = function (a) {
            return { type: "b", value: a.value, indices: [q, e - 1] };
          },
          Ya = function (a, b) {
            return { type: "bc", value: [a, b], indices: [q, e - 1] };
          },
          sa = ",",
          ta = f(",", !1),
          F = ".",
          G = f(".", !1),
          ma = function (a, b) {
            return { type: "bcv", value: [a, b], indices: [q, e - 1] };
          },
          Ka = "-",
          La = f("-", !1),
          Za = function (a, b) {
            return { type: "bc", value: [b, a], indices: [q, e - 1] };
          },
          $a = "th",
          hc = f("th", !1),
          ab = "nd",
          ic = f("nd", !1),
          bb = "st",
          jc = f("st", !1),
          cb = "/1\u001f",
          kc = f("/1\u001f", !1),
          db = function (a, b) {
            return { type: "cv", value: [a, b], indices: [q, e - 1] };
          },
          ua = "ff",
          eb = f("ff", !1),
          va = /^[a-z0-9]/,
          wa = g(
            [
              ["a", "z"],
              ["0", "9"]
            ],
            !1,
            !1
          ),
          fb = "f",
          gb = f("f", !1),
          Na = /^[a-z]/,
          Oa = g([["a", "z"]], !1, !1),
          hb = "/9\u001f",
          lc = f("/9\u001f", !1),
          ib = "/2\u001f",
          mc = f("/2\u001f", !1),
          jb = ".1",
          nc = f(".1", !1),
          Pa = /^[0-9]/,
          Qa = g([["0", "9"]], !1, !1),
          oc = /^[a-e]/,
          pc = g([["a", "e"]], !1, !1),
          kb = function (a) {
            return { type: "v", value: [a], indices: [q, e - 1] };
          },
          lb = "ch",
          qc = f("ch", !1),
          mb = "apters",
          rc = f("apters", !1),
          nb = "apter",
          sc = f("apter", !1),
          ob = "apts",
          tc = f("apts", !1),
          pb = "pts",
          uc = f("pts", !1),
          qb = "apt",
          vc = f("apt", !1),
          rb = "aps",
          wc = f("aps", !1),
          sb = "ap",
          xc = f("ap", !1),
          yc = "p",
          zc = f("p", !1),
          tb = "s",
          ub = f("s", !1),
          Ac = "a",
          Bc = f("a", !1),
          vb = "v",
          wb = f("v", !1),
          xb = "erses",
          Cc = f("erses", !1),
          yb = "erse",
          Dc = f("erse", !1),
          zb = "er",
          Ec = f("er", !1),
          Ab = "ss",
          Fc = f("ss", !1),
          Bb = ":",
          Cb = f(":", !1),
          Gc = /^["']/,
          Hc = g(['"', "'"], !1, !1),
          Ra = /^[,;\/:&\-\u2013\u2014~]/,
          Db = g(",;/:&-\u2013\u2014~".split(""), !1, !1),
          xa = "and",
          Eb = f("and", !1),
          ya = "compare",
          Fb = f("compare", !1),
          za = "cf",
          Gb = f("cf", !1),
          P = "see",
          Aa = f("see", !1),
          Q = "also",
          Ba = f("also", !1),
          Hb = /^[\-\u2013\u2014]/,
          Ib = g(["-", "\u2013", "\u2014"], !1, !1),
          Ca = "through",
          Jb = f("through", !1),
          Da = "thru",
          Kb = f("thru", !1),
          Ea = "to",
          Lb = f("to", !1),
          Mb = "title",
          Ic = f("title", !1),
          Nb = "from",
          Jc = f("from", !1),
          Fa = "of",
          Ob = f("of", !1),
          Pb = "in",
          Kc = f("in", !1),
          Qb = "the",
          Lc = f("the", !1),
          Rb = "book",
          Mc = f("book", !1),
          Sb = /^[([]/,
          Tb = g(["(", "["], !1, !1),
          Nc = /^[)\]]/,
          Oc = g([")", "]"], !1, !1),
          Ub = function (a) {
            return {
              type: "translation_sequence",
              value: a,
              indices: [q, e - 1]
            };
          },
          Vb = "\u001e",
          Wb = f("\u001e", !1);
        f(",000", !1);
        var Xb = /^[^\x1F\x1E([]/,
          Yb = g(["\u001f", "\u001e", "(", "["], !0, !1);
        g(" \t\r\n\u00a0*".split(""), !1, !1);
        var e = 0,
          q = 0,
          pa = [{ line: 1, column: 1 }],
          M = 0,
          Ha = [],
          p = 0;
        if ("startRule" in c) {
          if (!(c.startRule in Zb))
            throw Error(
              "Can't start parsing from rule \"" + c.startRule + '".'
            );
          $b = Zb[c.startRule];
        }
        "punctuation_strategy" in c &&
          "eu" === c.punctuation_strategy &&
          ((H = oa), (Ra = /^[;\/:&\-\u2013\u2014~]/));
        var Sa = $b();
        if (Sa !== b && e === d.length) return Sa;
        Sa !== b && e < d.length && m({ type: "end" });
        throw (function (b, c, d) {
          return new a(a.buildMessage(b, c), b, c, d);
        })(
          Ha,
          M < d.length ? d.charAt(M) : null,
          M < d.length ? k(M, M + 1) : k(M, M)
        );
      }
    };
  })(this);
}.call(this));

var bcv = new bcv_parser();
bcv.set_options({
  book_alone_strategy: "include",
  book_sequence_strategy: "include"
});
do_parse();
/*	document.getElementById("q").addEventListener("keyup", do_parse, false); */
/*	document.getElementById("q").focus(); */

function do_parse() {
  var s = document.getElementById("q").value;
  var osises = bcv.parse(s).osis_and_indices();

  if (osises.length > 0) {
  }
  for (var i = 0, last = osises.length; i < last; i++) {
    var osis = osises[i];
    var text = s.substr(osis.indices[0], osis.indices[1] - osis.indices[0]);
    document.getElementById("stevie").innerHTML = osis.osis;
    var sgverse = document.getElementById("sg-passage");
    sgverse.setAttribute("data-passage", osis.osis);
  }
}

var GLOBALBIBLE = (function (e) {
  "use strict";
  var t = function (e, n) {
    return (t =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function (e, t) {
          e.__proto__ = t;
        }) ||
      function (e, t) {
        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
      })(e, n);
  };
  function n(e, n) {
    function r() {
      this.constructor = e;
    }
    t(e, n),
      (e.prototype =
        null === n ? Object.create(n) : ((r.prototype = n.prototype), new r()));
  }
  var r = function () {
    return (r =
      Object.assign ||
      function (e) {
        for (var t, n = 1, r = arguments.length; n < r; n++)
          for (var i in (t = arguments[n]))
            Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
        return e;
      }).apply(this, arguments);
  };
  function i(e, t, n, r) {
    return new (n || (n = Promise))(function (i, s) {
      function o(e) {
        try {
          a(r.next(e));
        } catch (e) {
          s(e);
        }
      }
      function l(e) {
        try {
          a(r.throw(e));
        } catch (e) {
          s(e);
        }
      }
      function a(e) {
        e.done
          ? i(e.value)
          : new n(function (t) {
              t(e.value);
            }).then(o, l);
      }
      a((r = r.apply(e, t || [])).next());
    });
  }
  function s(e, t) {
    var n,
      r,
      i,
      s,
      o = {
        label: 0,
        sent: function () {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
    return (
      (s = { next: l(0), throw: l(1), return: l(2) }),
      "function" == typeof Symbol &&
        (s[Symbol.iterator] = function () {
          return this;
        }),
      s
    );
    function l(s) {
      return function (l) {
        return (function (s) {
          if (n) throw new TypeError("Generator is already executing.");
          for (; o; )
            try {
              if (
                ((n = 1),
                r &&
                  (i =
                    2 & s[0]
                      ? r.return
                      : s[0]
                      ? r.throw || ((i = r.return) && i.call(r), 0)
                      : r.next) &&
                  !(i = i.call(r, s[1])).done)
              )
                return i;
              switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                case 0:
                case 1:
                  i = s;
                  break;
                case 4:
                  return o.label++, { value: s[1], done: !1 };
                case 5:
                  o.label++, (r = s[1]), (s = [0]);
                  continue;
                case 7:
                  (s = o.ops.pop()), o.trys.pop();
                  continue;
                default:
                  if (
                    !(i = (i = o.trys).length > 0 && i[i.length - 1]) &&
                    (6 === s[0] || 2 === s[0])
                  ) {
                    o = 0;
                    continue;
                  }
                  if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                    o.label = s[1];
                    break;
                  }
                  if (6 === s[0] && o.label < i[1]) {
                    (o.label = i[1]), (i = s);
                    break;
                  }
                  if (i && o.label < i[2]) {
                    (o.label = i[2]), o.ops.push(s);
                    break;
                  }
                  i[2] && o.ops.pop(), o.trys.pop();
                  continue;
              }
              s = t.call(e, o);
            } catch (e) {
              (s = [6, e]), (r = 0);
            } finally {
              n = i = 0;
            }
          if (5 & s[0]) throw s[1];
          return { value: s[0] ? s[1] : void 0, done: !0 };
        })([s, l]);
      };
    }
  }
  var o,
    l,
    a,
    c,
    u,
    p,
    f = {},
    d = [],
    h = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;
  function m(e, t) {
    for (var n in t) e[n] = t[n];
    return e;
  }
  function y(e) {
    var t = e.parentNode;
    t && t.removeChild(e);
  }
  function g(e, t, n) {
    var r,
      i,
      s,
      o,
      l = arguments;
    if (((t = m({}, t)), arguments.length > 3))
      for (n = [n], r = 3; r < arguments.length; r++) n.push(l[r]);
    if ((null != n && (t.children = n), null != e && null != e.defaultProps))
      for (i in e.defaultProps) void 0 === t[i] && (t[i] = e.defaultProps[i]);
    return (
      (o = t.key),
      null != (s = t.ref) && delete t.ref,
      null != o && delete t.key,
      C(e, t, o, s)
    );
  }
  function C(e, t, n, r) {
    var i = {
      type: e,
      props: t,
      key: n,
      ref: r,
      __k: null,
      __p: null,
      __b: 0,
      __e: null,
      l: null,
      __c: null,
      constructor: void 0
    };
    return o.vnode && o.vnode(i), i;
  }
  function _(e) {
    return e.children;
  }
  function v(e, t) {
    (this.props = e), (this.context = t);
  }
  function b(e, t) {
    if (null == t) return e.__p ? b(e.__p, e.__p.__k.indexOf(e) + 1) : null;
    for (var n; t < e.__k.length; t++)
      if (null != (n = e.__k[t]) && null != n.__e) return n.__e;
    return "function" == typeof e.type ? b(e) : null;
  }
  function w(e) {
    ((!e.__d && (e.__d = !0) && 1 === l.push(e)) ||
      c !== o.debounceRendering) &&
      ((c = o.debounceRendering), (o.debounceRendering || a)(x));
  }
  function x() {
    var e;
    for (
      l.sort(function (e, t) {
        return t.__v.__b - e.__v.__b;
      });
      (e = l.pop());

    )
      e.__d && e.forceUpdate(!1);
  }
  function k(e, t, n, r, i, s, o, l, a) {
    var c,
      u,
      p,
      h,
      m,
      g,
      C,
      _ = (n && n.__k) || d,
      v = _.length;
    if (
      (l == f && (l = null != s ? s[0] : v ? b(n, 0) : null),
      (c = 0),
      (t.__k = L(t.__k, function (n) {
        if (null != n) {
          if (
            ((n.__p = t),
            (n.__b = t.__b + 1),
            null === (p = _[c]) || (p && n.key == p.key && n.type === p.type))
          )
            _[c] = void 0;
          else
            for (u = 0; u < v; u++) {
              if ((p = _[u]) && n.key == p.key && n.type === p.type) {
                _[u] = void 0;
                break;
              }
              p = null;
            }
          if (
            ((h = N(e, n, (p = p || f), r, i, s, o, null, l, a)),
            (u = n.ref) && p.ref != u && (C || (C = [])).push(u, n.__c || h, n),
            null != h)
          ) {
            if ((null == g && (g = h), null != n.l)) (h = n.l), (n.l = null);
            else if (s == p || h != l || null == h.parentNode) {
              e: if (null == l || l.parentNode !== e) e.appendChild(h);
              else {
                for (m = l, u = 0; (m = m.nextSibling) && u < v; u += 2)
                  if (m == h) break e;
                e.insertBefore(h, l);
              }
              "option" == t.type && (e.value = "");
            }
            (l = h.nextSibling), "function" == typeof t.type && (t.l = h);
          }
        }
        return c++, n;
      })),
      (t.__e = g),
      null != s && "function" != typeof t.type)
    )
      for (c = s.length; c--; ) null != s[c] && y(s[c]);
    for (c = v; c--; ) null != _[c] && O(_[c], _[c]);
    if (C) for (c = 0; c < C.length; c++) P(C[c], C[++c], C[++c]);
  }
  function L(e, t, n) {
    if ((null == n && (n = []), null == e || "boolean" == typeof e))
      t && n.push(t(null));
    else if (Array.isArray(e)) for (var r = 0; r < e.length; r++) L(e[r], t, n);
    else
      n.push(
        t
          ? t(
              (function (e) {
                if (null == e || "boolean" == typeof e) return null;
                if ("string" == typeof e || "number" == typeof e)
                  return C(null, e, null, null);
                if (null != e.__e || null != e.__c) {
                  var t = C(e.type, e.props, e.key, null);
                  return (t.__e = e.__e), t;
                }
                return e;
              })(e)
            )
          : e
      );
    return n;
  }
  function S(e, t, n) {
    "-" === t[0]
      ? e.setProperty(t, n)
      : (e[t] = "number" == typeof n && !1 === h.test(t) ? n + "px" : n || "");
  }
  function E(e, t, n, r, i) {
    var s, o, l, a, c;
    if (
      "key" ===
        (t = i
          ? "className" === t
            ? "class"
            : t
          : "class" === t
          ? "className"
          : t) ||
      "children" === t
    );
    else if ("style" === t)
      if (((s = e.style), "string" == typeof n)) s.cssText = n;
      else {
        if (("string" == typeof r && ((s.cssText = ""), (r = null)), r))
          for (o in r) (n && o in n) || S(s, o, "");
        if (n) for (l in n) (r && n[l] === r[l]) || S(s, l, n[l]);
      }
    else
      "o" === t[0] && "n" === t[1]
        ? ((a = t !== (t = t.replace(/Capture$/, ""))),
          (c = t.toLowerCase()),
          (t = (c in e ? c : t).slice(2)),
          n
            ? (r || e.addEventListener(t, M, a), ((e.u || (e.u = {}))[t] = n))
            : e.removeEventListener(t, M, a))
        : "list" !== t && "tagName" !== t && "form" !== t && !i && t in e
        ? (e[t] = null == n ? "" : n)
        : "function" != typeof n &&
          "dangerouslySetInnerHTML" !== t &&
          (t !== (t = t.replace(/^xlink:?/, ""))
            ? null == n || !1 === n
              ? e.removeAttributeNS(
                  "http://www.w3.org/1999/xlink",
                  t.toLowerCase()
                )
              : e.setAttributeNS(
                  "http://www.w3.org/1999/xlink",
                  t.toLowerCase(),
                  n
                )
            : null == n || !1 === n
            ? e.removeAttribute(t)
            : e.setAttribute(t, n));
  }
  function M(e) {
    return this.u[e.type](o.event ? o.event(e) : e);
  }
  function N(e, t, n, r, i, s, l, a, c, u) {
    var p,
      f,
      d,
      h,
      y,
      g,
      C,
      b,
      w,
      x,
      L = t.type;
    if (void 0 !== t.constructor) return null;
    (p = o.__b) && p(t);
    try {
      e: if ("function" == typeof L) {
        if (
          ((b = t.props),
          (w = (p = L.contextType) && r[p.__c]),
          (x = p ? (w ? w.props.value : p.__p) : r),
          n.__c
            ? (C = (f = t.__c = n.__c).__p = f.__E)
            : ("prototype" in L && L.prototype.render
                ? (t.__c = f = new L(b, x))
                : ((t.__c = f = new v(b, x)),
                  (f.constructor = L),
                  (f.render = H)),
              w && w.sub(f),
              (f.props = b),
              f.state || (f.state = {}),
              (f.context = x),
              (f.__n = r),
              (d = f.__d = !0),
              (f.__h = [])),
          null == f.__s && (f.__s = f.state),
          null != L.getDerivedStateFromProps &&
            m(
              f.__s == f.state ? (f.__s = m({}, f.__s)) : f.__s,
              L.getDerivedStateFromProps(b, f.__s)
            ),
          d)
        )
          null == L.getDerivedStateFromProps &&
            null != f.componentWillMount &&
            f.componentWillMount(),
            null != f.componentDidMount && l.push(f);
        else {
          if (
            (null == L.getDerivedStateFromProps &&
              null == a &&
              null != f.componentWillReceiveProps &&
              f.componentWillReceiveProps(b, x),
            !a &&
              null != f.shouldComponentUpdate &&
              !1 === f.shouldComponentUpdate(b, f.__s, x))
          ) {
            for (
              f.props = b,
                f.state = f.__s,
                f.__d = !1,
                f.__v = t,
                t.__e = null != c ? (c !== n.__e ? c : n.__e) : null,
                t.__k = n.__k,
                p = 0;
              p < t.__k.length;
              p++
            )
              t.__k[p] && (t.__k[p].__p = t);
            break e;
          }
          null != f.componentWillUpdate && f.componentWillUpdate(b, f.__s, x);
        }
        for (
          h = f.props,
            y = f.state,
            f.context = x,
            f.props = b,
            f.state = f.__s,
            (p = o.__r) && p(t),
            f.__d = !1,
            f.__v = t,
            f.__P = e,
            p = f.render(f.props, f.state, f.context),
            t.__k =
              null != p && p.type == _ && null == p.key ? p.props.children : p,
            null != f.getChildContext && (r = m(m({}, r), f.getChildContext())),
            d ||
              null == f.getSnapshotBeforeUpdate ||
              (g = f.getSnapshotBeforeUpdate(h, y)),
            k(e, t, n, r, i, s, l, c, u),
            f.base = t.__e;
          (p = f.__h.pop());

        )
          f.__s && (f.state = f.__s), p.call(f);
        d ||
          null == h ||
          null == f.componentDidUpdate ||
          f.componentDidUpdate(h, y, g),
          C && (f.__E = f.__p = null);
      } else t.__e = A(n.__e, t, n, r, i, s, l, u);
      (p = o.diffed) && p(t);
    } catch (e) {
      o.__e(e, t, n);
    }
    return t.__e;
  }
  function T(e, t) {
    for (var n; (n = e.pop()); )
      try {
        n.componentDidMount();
      } catch (e) {
        o.__e(e, n.__v);
      }
    o.__c && o.__c(t);
  }
  function A(e, t, n, r, i, s, o, l) {
    var a,
      c,
      u,
      p,
      h = n.props,
      m = t.props;
    if (((i = "svg" === t.type || i), null == e && null != s))
      for (a = 0; a < s.length; a++)
        if (
          null != (c = s[a]) &&
          (null === t.type ? 3 === c.nodeType : c.localName === t.type)
        ) {
          (e = c), (s[a] = null);
          break;
        }
    if (null == e) {
      if (null === t.type) return document.createTextNode(m);
      (e = i
        ? document.createElementNS("http://www.w3.org/2000/svg", t.type)
        : document.createElement(t.type)),
        (s = null);
    }
    return (
      null === t.type
        ? h !== m && (null != s && (s[s.indexOf(e)] = null), (e.data = m))
        : t !== n &&
          (null != s && (s = d.slice.call(e.childNodes)),
          (u = (h = n.props || f).dangerouslySetInnerHTML),
          (p = m.dangerouslySetInnerHTML),
          l ||
            ((p || u) &&
              ((p && u && p.__html == u.__html) ||
                (e.innerHTML = (p && p.__html) || ""))),
          (function (e, t, n, r, i) {
            var s;
            for (s in n) s in t || E(e, s, null, n[s], r);
            for (s in t)
              (i && "function" != typeof t[s]) ||
                "value" === s ||
                "checked" === s ||
                n[s] === t[s] ||
                E(e, s, t[s], n[s], r);
          })(e, m, h, i, l),
          (t.__k = t.props.children),
          p || k(e, t, n, r, "foreignObject" !== t.type && i, s, o, f, l),
          l ||
            ("value" in m &&
              void 0 !== m.value &&
              m.value !== e.value &&
              (e.value = null == m.value ? "" : m.value),
            "checked" in m &&
              void 0 !== m.checked &&
              m.checked !== e.checked &&
              (e.checked = m.checked))),
      e
    );
  }
  function P(e, t, n) {
    try {
      "function" == typeof e ? e(t) : (e.current = t);
    } catch (e) {
      o.__e(e, n);
    }
  }
  function O(e, t, n) {
    var r, i, s;
    if (
      (o.unmount && o.unmount(e),
      (r = e.ref) && P(r, null, t),
      n || "function" == typeof e.type || (n = null != (i = e.__e)),
      (e.__e = e.l = null),
      null != (r = e.__c))
    ) {
      if (r.componentWillUnmount)
        try {
          r.componentWillUnmount();
        } catch (e) {
          o.__e(e, t);
        }
      r.base = r.__P = null;
    }
    if ((r = e.__k)) for (s = 0; s < r.length; s++) r[s] && O(r[s], t, n);
    null != i && y(i);
  }
  function H(e, t, n) {
    return this.constructor(e, n);
  }
  function R(e, t, n) {
    var r, i, s;
    o.__p && o.__p(e, t),
      (i = (r = n === u) ? null : (n && n.__k) || t.__k),
      (e = g(_, null, [e])),
      (s = []),
      N(
        t,
        r ? (t.__k = e) : ((n || t).__k = e),
        i || f,
        f,
        void 0 !== t.ownerSVGElement,
        n && !r ? [n] : i ? null : d.slice.call(t.childNodes),
        s,
        !1,
        n || f,
        r
      ),
      T(s, e);
  }
  function j(e, t) {
    R(e, t, u);
  }
  function q(e, t) {
    return (
      (t = m(m({}, e.props), t)),
      arguments.length > 2 && (t.children = d.slice.call(arguments, 2)),
      C(e.type, t, t.key || e.key, t.ref || e.ref)
    );
  }
  (o = {}),
    (v.prototype.setState = function (e, t) {
      var n =
        (this.__s !== this.state && this.__s) || (this.__s = m({}, this.state));
      ("function" != typeof e || (e = e(n, this.props))) && m(n, e),
        null != e && this.__v && (t && this.__h.push(t), w(this));
    }),
    (v.prototype.forceUpdate = function (e) {
      var t,
        n,
        r,
        i = this.__v,
        s = this.__v.__e,
        o = this.__P;
      o &&
        ((t = !1 !== e),
        (n = []),
        (r = N(
          o,
          i,
          m({}, i),
          this.__n,
          void 0 !== o.ownerSVGElement,
          null,
          n,
          t,
          null == s ? b(i) : s
        )),
        T(n, i),
        r != s &&
          (function e(t) {
            var n, r;
            if (null != (t = t.__p) && null != t.__c) {
              for (t.__e = t.__c.base = null, n = 0; n < t.__k.length; n++)
                if (null != (r = t.__k[n]) && null != r.__e) {
                  t.__e = t.__c.base = r.__e;
                  break;
                }
              return e(t);
            }
          })(i)),
        e && e();
    }),
    (v.prototype.render = _),
    (l = []),
    (a =
      "function" == typeof Promise
        ? Promise.prototype.then.bind(Promise.resolve())
        : setTimeout),
    (c = o.debounceRendering),
    (o.__e = function (e, t, n) {
      for (var r; (t = t.__p); )
        if ((r = t.__c) && !r.__p)
          try {
            if (r.constructor && null != r.constructor.getDerivedStateFromError)
              r.setState(r.constructor.getDerivedStateFromError(e));
            else {
              if (null == r.componentDidCatch) continue;
              r.componentDidCatch(e);
            }
            return w((r.__E = r));
          } catch (t) {
            e = t;
          }
      throw e;
    }),
    (u = f),
    (p = 0);
  var D = "https://api.global.bible";
  function z(e, t) {
    return (
      void 0 === t && (t = "GET"),
      i(this, void 0, void 0, function () {
        var n;
        return s(this, function (r) {
          switch (r.label) {
            case 0:
              return [
                4,
                fetch(e, {
                  method: t,
                  mode: "cors",
                  headers: { "Content-Type": "application/json" }
                })
              ];
            case 1:
              if ((n = r.sent()).status >= 300) throw new Error("bad response");
              return [4, n.json()];
            case 2:
              return [2, r.sent()];
          }
        });
      })
    );
  }
  function B(e) {
    return !!(e && e.subdomain && e.title && e.bibles && e.bibles.length > 0);
  }
  var J,
    U = "https://bibles.org";
  function Z() {
    return {
      bible: "555fef9a6cb31151-01",
      url: U,
      passage: "JHN.1.1",
      display: J.MODAL
    };
  }
  function V(e) {
    return i(this, void 0, void 0, function () {
      var t, n, r, i, o, l;
      return s(this, function (s) {
        switch (s.label) {
          case 0:
            e.search("//") < 0 &&
              (console.warn(
                "Please make sure your site URL begins with 'https://'."
              ),
              (e = "https://" + e)),
              (t = 0),
              (n = [e, U]),
              (s.label = 1);
          case 1:
            if (!(t < n.length)) return [3, 6];
            (r = n[t]), (s.label = 2);
          case 2:
            return (
              s.trys.push([2, 4, , 5]),
              console.debug("attempting to load site", r),
              (i = new URL(r).hostname),
              [4, z(D + "/sites/findOne?domain=" + i)]
            );
          case 3:
            return (
              (o = s.sent().site),
              console.debug("got site data", o),
              B(o) ? [2, { url: r, site: o }] : [3, 5]
            );
          case 4:
            return (
              (l = s.sent()),
              console.warn({
                msg: "error getting site info",
                url: r,
                error: l
              }),
              [3, 5]
            );
          case 5:
            return t++, [3, 1];
          case 6:
            return [2, { url: "", site: void 0 }];
        }
      });
    });
  }
  function I(e) {
    return i(this, void 0, void 0, function () {
      var t, n, i;
      return s(this, function (s) {
        switch (s.label) {
          case 0:
            return [4, V(e.url)];
          case 1:
            if (((t = s.sent()), (n = t.url), B((i = t.site)) && n))
              return n === e.url &&
                i.bibles.find(function (t) {
                  return t.id === e.bible;
                })
                ? [2, e]
                : (console.warn(
                    "site doesn't have access to the requested bible",
                    {
                      url: n,
                      requestedBible: e.bible,
                      usingAlternate: i.bibles[0].id
                    }
                  ),
                  [2, r(r({}, e), { url: n, bible: i.bibles[0].id })]);
            throw new Error(
              "can't load Bible \"" + e.bible + '" from URL "' + e.url + '"'
            );
        }
      });
    });
  }
  function F(e) {
    var t = e.url;
    return t.indexOf("http://") > -1 || t.indexOf("https://") > -1
      ? t
      : "https://" + t;
  }
  !(function (e) {
    (e.TAB = "tab"), (e.MODAL = "modal");
  })(J || (J = {}));
  var W = function () {
      return g(
        "div",
        { className: "gb-passage-icon-container" },
        g(
          "svg",
          {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg"
          },
          g("path", {
            d:
              "M23.119 20L13.772 2.15C13.6026 1.82674 13.348 1.55599 13.0357 1.36709C12.7235 1.17818 12.3655 1.07832 12.0005 1.07832C11.6355 1.07832 11.2775 1.17818 10.9653 1.36709C10.653 1.55599 10.3984 1.82674 10.229 2.15L0.881002 20C0.721322 20.3048 0.643006 20.6457 0.653624 20.9897C0.664243 21.3337 0.763438 21.6691 0.941617 21.9635C1.1198 22.2579 1.37093 22.5014 1.67073 22.6704C1.97054 22.8393 2.30887 22.9281 2.653 22.928H21.347C21.6911 22.9281 22.0295 22.8393 22.3293 22.6704C22.6291 22.5014 22.8802 22.2579 23.0584 21.9635C23.2366 21.6691 23.3358 21.3337 23.3464 20.9897C23.357 20.6457 23.2787 20.3048 23.119 20ZM11 8.423C11 8.15778 11.1054 7.90343 11.2929 7.71589C11.4804 7.52836 11.7348 7.423 12 7.423C12.2652 7.423 12.5196 7.52836 12.7071 7.71589C12.8946 7.90343 13 8.15778 13 8.423V14.423C13 14.6882 12.8946 14.9426 12.7071 15.1301C12.5196 15.3176 12.2652 15.423 12 15.423C11.7348 15.423 11.4804 15.3176 11.2929 15.1301C11.1054 14.9426 11 14.6882 11 14.423V8.423ZM12.05 19.933H12.022C11.6276 19.9317 11.249 19.778 10.9654 19.5041C10.6817 19.2301 10.515 18.8571 10.5 18.463C10.4928 18.267 10.5247 18.0715 10.5939 17.888C10.6631 17.7045 10.7682 17.5366 10.903 17.3942C11.0378 17.2517 11.1996 17.1376 11.3791 17.0584C11.5585 16.9792 11.7519 16.9366 11.948 16.933H11.976C12.3703 16.9335 12.7491 17.0864 13.0332 17.3599C13.3172 17.6333 13.4845 18.006 13.5 18.4C13.5078 18.5964 13.4762 18.7924 13.4071 18.9765C13.338 19.1605 13.2328 19.3289 13.0977 19.4718C12.9626 19.6146 12.8004 19.729 12.6204 19.8082C12.4405 19.8874 12.2466 19.9298 12.05 19.933Z",
            fill: "#999"
          })
        )
      );
    },
    G = function () {
      return g(
        "div",
        { className: "gb-passage-icon-container" },
        g(
          "svg",
          {
            width: "24",
            height: "24",
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            className: "gb-passage-loading-icon"
          },
          g("path", {
            d:
              "M22.5 12C22.5 17.5468 18.199 22.089 12.7501 22.4736C12.3369 22.5028 12 22.8358 12 23.25C12 23.6642 12.3367 24.0024 12.7501 23.9769C19.0281 23.5897 24 18.3755 24 12C24 5.37258 18.6274 0 12 0C5.62452 0 0.410279 4.97188 0.0230648 11.2499C-0.0024346 11.6633 0.335786 12 0.75 12C1.16421 12 1.49722 11.6631 1.52638 11.2499C1.91099 5.80099 6.45322 1.5 12 1.5C17.799 1.5 22.5 6.20101 22.5 12Z",
            fill: "#999"
          })
        )
      );
    };
  function K(e, t) {
    return (
      (t = t || {}),
      new Promise(function (n, r) {
        var i = new XMLHttpRequest(),
          s = [],
          o = [],
          l = {},
          a = function () {
            return {
              ok: 2 == ((i.status / 100) | 0),
              statusText: i.statusText,
              status: i.status,
              url: i.responseURL,
              text: function () {
                return Promise.resolve(i.responseText);
              },
              json: function () {
                return Promise.resolve(JSON.parse(i.responseText));
              },
              blob: function () {
                return Promise.resolve(new Blob([i.response]));
              },
              clone: a,
              headers: {
                keys: function () {
                  return s;
                },
                entries: function () {
                  return o;
                },
                get: function (e) {
                  return l[e.toLowerCase()];
                },
                has: function (e) {
                  return e.toLowerCase() in l;
                }
              }
            };
          };
        for (var c in (i.open(t.method || "get", e, !0),
        (i.onload = function () {
          i
            .getAllResponseHeaders()
            .replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (e, t, n) {
              s.push((t = t.toLowerCase())),
                o.push([t, n]),
                (l[t] = l[t] ? l[t] + "," + n : n);
            }),
            n(a());
        }),
        (i.onerror = r),
        (i.withCredentials = "include" == t.credentials),
        t.headers))
          i.setRequestHeader(c, t.headers[c]);
        i.send(t.body || null);
      })
    );
  }
  function $(e, t) {
    void 0 === t && (t = {});
    var n = t.insertAt;
    if (e && "undefined" != typeof document) {
      var r = document.head || document.getElementsByTagName("head")[0],
        i = document.createElement("style");
      (i.type = "text/css"),
        "top" === n && r.firstChild
          ? r.insertBefore(i, r.firstChild)
          : r.appendChild(i),
        i.styleSheet
          ? (i.styleSheet.cssText = e)
          : i.appendChild(document.createTextNode(e));
    }
  }
  $(
    '.scripture-styles{font-size:18px;font-family:"Noto Serif",serif;line-height:1.5;color:#111}.scripture-styles html,.scripture-styles body,.scripture-styles div,.scripture-styles span,.scripture-styles applet,.scripture-styles object,.scripture-styles iframe,.scripture-styles h1,.scripture-styles h2,.scripture-styles h3,.scripture-styles h4,.scripture-styles h5,.scripture-styles h6,.scripture-styles p,.scripture-styles blockquote,.scripture-styles pre,.scripture-styles a,.scripture-styles abbr,.scripture-styles acronym,.scripture-styles address,.scripture-styles big,.scripture-styles cite,.scripture-styles code,.scripture-styles del,.scripture-styles dfn,.scripture-styles em,.scripture-styles img,.scripture-styles ins,.scripture-styles kbd,.scripture-styles q,.scripture-styles s,.scripture-styles samp,.scripture-styles small,.scripture-styles strike,.scripture-styles strong,.scripture-styles sub,.scripture-styles sup,.scripture-styles tt,.scripture-styles var,.scripture-styles b,.scripture-styles u,.scripture-styles i,.scripture-styles center,.scripture-styles dl,.scripture-styles dt,.scripture-styles dd,.scripture-styles ol,.scripture-styles ul,.scripture-styles li,.scripture-styles fieldset,.scripture-styles form,.scripture-styles label,.scripture-styles legend,.scripture-styles table,.scripture-styles caption,.scripture-styles tbody,.scripture-styles tfoot,.scripture-styles thead,.scripture-styles tr,.scripture-styles th,.scripture-styles td,.scripture-styles article,.scripture-styles aside,.scripture-styles canvas,.scripture-styles details,.scripture-styles embed,.scripture-styles figure,.scripture-styles figcaption,.scripture-styles footer,.scripture-styles header,.scripture-styles hgroup,.scripture-styles menu,.scripture-styles nav,.scripture-styles output,.scripture-styles ruby,.scripture-styles section,.scripture-styles summary,.scripture-styles time,.scripture-styles mark,.scripture-styles audio,.scripture-styles video{margin:0;padding:0;border:0;font-size:100%;font-family:inherit;vertical-align:baseline}.scripture-styles article,.scripture-styles aside,.scripture-styles details,.scripture-styles figcaption,.scripture-styles figure,.scripture-styles footer,.scripture-styles header,.scripture-styles hgroup,.scripture-styles menu,.scripture-styles nav,.scripture-styles section{display:block}.scripture-styles ol,.scripture-styles ul{list-style:none}.scripture-styles blockquote,.scripture-styles q{quotes:none}.scripture-styles blockquote:before,.scripture-styles blockquote:after,.scripture-styles q:before,.scripture-styles q:after{content:"";content:none}.scripture-styles table{border-collapse:collapse;border-spacing:0}.scripture-styles .c{text-align:center;font-weight:bold;font-size:1.3em}.scripture-styles .ca{font-style:italic;font-weight:normal;color:#777}.scripture-styles .ca:before{content:"("}.scripture-styles .ca:after{content:")" !important}.scripture-styles .cl{text-align:center;font-weight:bold}.scripture-styles .cd{margin-left:1em;margin-right:1em;font-style:italic}.scripture-styles .v,.scripture-styles .vp,.scripture-styles sup[class^="v"]{color:#000;font-size:0.7em;letter-spacing:-0.03em;vertical-align:0.25em;line-height:0;font-family:sans-serif;font-weight:bold;top:inherit}.scripture-styles .v:after,.scripture-styles .vp:after,.scripture-styles sup[class^="v"]:after{content:"\\a0"}.scripture-styles sup+sup:before{content:"\\a0"}.scripture-styles .va{font-style:italic}.scripture-styles .va:before{content:"("}.scripture-styles .va:after{content:")" !important}.scripture-styles .x{font-size:0.85rem;box-sizing:border-box;display:inline-block;position:relative;padding:0 0.4em;margin:0 0.1em;text-indent:0;text-align:left;border-radius:4px;border:1px solid #dcdcdc}.scripture-styles .xo{font-weight:bold}.scripture-styles .xk{font-style:italic}.scripture-styles .xq{font-style:italic}.scripture-styles .notelink{text-decoration:underline;padding:.1em}.scripture-styles .notelink,.scripture-styles .notelink:hover,.scripture-styles .notelink:active,.scripture-styles .notelink:visited{color:#6a6a6a}.scripture-styles .notelink sup{font-size:.7em;letter-spacing:-.03em;vertical-align:0.25em;line-height:0;font-family:sans-serif;font-weight:bold}.scripture-styles .notelink+sup:before{content:"\\a0"}.scripture-styles .f{font-size:0.85rem;display:inline-block;box-sizing:border-box;padding:0 0.4em;margin:0 0.1em;text-indent:0;text-align:left;border-radius:4px;border:1px solid #dcdcdc}.scripture-styles .fr{font-weight:bold}.scripture-styles .fk{font-style:italic;font-variant:small-caps}.scripture-styles [class^="fq"]{font-style:italic}.scripture-styles .fl{font-style:italic;font-weight:bold}.scripture-styles .fv{color:#515151;font-size:0.75em;letter-spacing:-0.03em;vertical-align:0.25em;line-height:0;font-family:sans-serif;font-weight:bold}.scripture-styles .fv:after{content:"\\a0"}.scripture-styles .h{text-align:center;font-style:italic}.scripture-styles [class^="imt"]{text-align:center;font-weight:bold}.scripture-styles .imt,.scripture-styles .imt1,.scripture-styles .imte,.scripture-styles .imte1{font-size:1.4em}.scripture-styles .imt2,.scripture-styles .imte2{font-size:1.3em}.scripture-styles .imt3,.scripture-styles .imte3{font-size:1.2em}.scripture-styles .imt4,.scripture-styles .imte4{font-size:1.1em}.scripture-styles [class^="is"]{font-size:1.1em;text-align:center;font-weight:bold}.scripture-styles [class^="ip"]{text-indent:1em}.scripture-styles .ipi{padding-left:1em;padding-right:1em}.scripture-styles .im{text-indent:0}.scripture-styles .imi{text-indent:0;margin-left:1em;margin-right:1em}.scripture-styles .ipq{font-style:italic;margin-left:1em;margin-right:1em}.scripture-styles .imq{margin-left:1em;margin-right:1em}.scripture-styles .ipr{text-align:right;text-indent:0}.scripture-styles [class^="iq"]{margin-left:1em;margin-right:1em}.scripture-styles .iq2{text-indent:1em}.scripture-styles [class^="ili"]{padding-left:1em;text-indent:-1em}.scripture-styles .ili1{margin-left:1em;margin-right:1em}.scripture-styles .ili2{margin-left:2em;margin-right:1em}.scripture-styles .iot{font-weight:bold;font-size:1.1em;margin-top:1.5em}.scripture-styles .io,.scripture-styles .io1{margin-left:1em;margin-right:0em}.scripture-styles .io2{margin-left:2em;margin-right:0em}.scripture-styles .io3{margin-left:3em;margin-right:0em}.scripture-styles .io4{margin-left:4em;margin-right:0em}.scripture-styles .ior{font-style:italic}.scripture-styles .iex{text-indent:1em}.scripture-styles .iqt{text-indent:1em;font-style:italic}.scripture-styles [class^="p"]{text-indent:1em}.scripture-styles .m{text-indent:0 !important}.scripture-styles .pmo{text-indent:0;margin-left:1em;margin-right:0em}.scripture-styles .pm{margin-left:1em;margin-right:0em}.scripture-styles .pmr{text-align:right}.scripture-styles .pmc{margin-left:1em;margin-right:0em}.scripture-styles .pi{margin-left:1em;margin-right:0em}.scripture-styles .pi1{margin-left:2em;margin-right:0em}.scripture-styles .pi2{margin-left:3em;margin-right:0em}.scripture-styles .pi3{margin-left:4em;margin-right:0em}.scripture-styles .mi{margin-left:1em;margin-right:0em;text-indent:0}.scripture-styles .pc{text-align:center;text-indent:0}.scripture-styles .cls{text-align:right}.scripture-styles [class^="li"]{padding-left:1em;text-indent:-1em;margin-left:1em;margin-right:0em}.scripture-styles .li2{margin-left:2em;margin-right:0em}.scripture-styles .li3{margin-left:3em;margin-right:0em}.scripture-styles .li4{margin-left:4em;margin-right:0em}.scripture-styles [class^="q"]{padding-left:1em;text-indent:-1em;margin-left:1em;margin-right:0em}.scripture-styles .q2{margin-left:1.5em;margin-right:0em}.scripture-styles .q3{margin-left:2em;margin-right:0em}.scripture-styles .q4{margin-left:2.5em;margin-right:0em}.scripture-styles .qr{text-align:right;font-style:italic}.scripture-styles .qc{text-align:center}.scripture-styles .qs{font-style:italic;text-align:right}.scripture-styles .qa{text-align:center;font-style:italic;font-size:1.1em;margin-left:0em;margin-right:0em}.scripture-styles .qac{margin-left:0em;margin-right:0em;padding:0;text-indent:0;font-style:italic}.scripture-styles .qm2{margin-left:1.5em;margin-right:0em}.scripture-styles .qm3{margin-left:2em;margin-right:0em}.scripture-styles .qt{font-style:italic;text-indent:0;padding:0;margin:0}.scripture-styles .bk{font-style:italic}.scripture-styles .nd{font-variant:small-caps}.scripture-styles .add{font-style:italic}.scripture-styles .dc{font-style:italic}.scripture-styles .k{font-weight:bold;font-style:italic}.scripture-styles .lit{text-align:right;font-weight:bold}.scripture-styles .pn{font-weight:bold;text-decoration:underline}.scripture-styles .sls{font-style:italic}.scripture-styles .tl{font-style:italic}.scripture-styles .wj{color:#CC0000}.scripture-styles .em{font-style:italic}.scripture-styles .bd{font-weight:bold}.scripture-styles .it{font-style:italic}.scripture-styles .bdit{font-weight:bold;font-style:italic}.scripture-styles .no{font-weight:normal;font-style:normal}.scripture-styles .sc{font-variant:small-caps}.scripture-styles .qt{font-style:italic}.scripture-styles .sig{font-weight:normal;font-style:italic}.scripture-styles table{width:100%;display:table}.scripture-styles .tr{display:table-row}.scripture-styles [class^="th"]{font-style:italic;display:table-cell}.scripture-styles [class^="thr"]{text-align:right;padding-right:1.5em}.scripture-styles [class^="tc"]{display:table-cell}.scripture-styles [class^="tcr"]{text-align:right;padding-right:1.5em}.scripture-styles [class^="mt"]{text-align:center;font-weight:bold;letter-spacing:normal}.scripture-styles .mt,.scripture-styles .mt1{font-size:2.8em}.scripture-styles .mt2{font-size:1.6em;font-style:italic;font-weight:normal}.scripture-styles [class^="ms"]{text-align:center;font-weight:bold;line-height:1.2;letter-spacing:normal}.scripture-styles .ms,.scripture-styles .ms1{font-size:1.6em}.scripture-styles .ms2{font-size:1.5em}.scripture-styles .ms3{font-size:1.4em}.scripture-styles .mr{font-size:0.9em;margin-bottom:1em;text-align:center;font-weight:normal;font-style:italic}.scripture-styles .s,.scripture-styles .s1{text-align:center;font-weight:bold;font-size:1.1em;letter-spacing:normal}.scripture-styles .s2{text-align:center;font-weight:bold;font-size:inherit;letter-spacing:normal}.scripture-styles .s3{text-align:center;font-weight:bold;font-size:inherit;letter-spacing:normal}.scripture-styles .s4{text-align:center;font-weight:bold;font-size:inherit;letter-spacing:normal}.scripture-styles .sr{font-weight:normal;font-style:italic;text-align:center;font-size:inherit;letter-spacing:normal}.scripture-styles .r{font-size:0.9em;font-weight:normal;font-style:italic;text-align:center;letter-spacing:normal}.scripture-styles .rq{font-size:0.85em;line-height:1.9;font-style:italic;text-align:right;letter-spacing:normal}.scripture-styles .d{font-style:italic;text-align:center;font-size:inherit;letter-spacing:normal}.scripture-styles .sp{text-align:left;font-weight:normal;font-style:italic;font-size:inherit;letter-spacing:normal}.scripture-styles [class^="p"]+.s,.scripture-styles [class^="p"]+.s1,.scripture-styles [class^="q"]+.s,.scripture-styles [class^="q"]+.s1{margin-top:1.5em}'
  );
  $(
    "@keyframes gb-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.gb-passage-icon-container {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n\n.gb-passage-loading-icon {\n  animation: gb-spin 1500ms linear infinite;\n}\n\n.scripture-styles .gb-passage-copyright {\n  text-align: center;\n  font-size: 12px;\n  color: rgb(102, 102, 102);\n  font-family: sans-serif;\n  padding: 20px 40px 2px;\n}\n"
  );
  var X = Z;
  function Y(e) {
    return i(this, void 0, void 0, function () {
      var t, n;
      return s(this, function (r) {
        switch (r.label) {
          case 0:
            return [4, K(e)];
          case 1:
            if ((t = r.sent()).status >= 300) throw t;
            return [4, t.json()];
          case 2:
            if (
              !(function (e) {
                return !(
                  !e ||
                  !(function (e) {
                    return !!(e && e.data && e.data.content);
                  })(e.passage)
                );
              })((n = r.sent()))
            )
              throw new Error("passage data response shaped incorrectly");
            return [2, n];
        }
      });
    });
  }
  var Q = function () {
      return {
        passage: "",
        copyright: "",
        reference: "",
        scriptDirection: "LTR"
      };
    },
    ee = (function (e) {
      function t() {
        var t = (null !== e && e.apply(this, arguments)) || this;
        return (t.state = { content: Q(), error: !1 }), t;
      }
      return (
        n(t, e),
        (t.prototype.loadPassage = function () {
          return i(this, void 0, void 0, function () {
            var e, t, n, r, i, o, l;
            return s(this, function (s) {
              switch (s.label) {
                case 0:
                  (e = this.props),
                    (t =
                      F(e) +
                      "/site-assets/passages/" +
                      e.passage +
                      "?bibleId=" +
                      this.props.bible),
                    (s.label = 1);
                case 1:
                  return s.trys.push([1, 3, , 4]), [4, Y(t)];
                case 2:
                  return (
                    (n = s.sent()),
                    (r = n.passage),
                    (i = n.bible),
                    (o = {
                      scriptDirection: i.language.scriptDirection || "LTR",
                      passage: r.data.content,
                      copyright: r.data.copyright,
                      reference: r.data.reference
                    }),
                    this.setState({ content: o }),
                    [3, 4]
                  );
                case 3:
                  return (
                    (l = s.sent()),
                    console.error(l),
                    this.setState({ error: !0 }),
                    [3, 4]
                  );
                case 4:
                  return [2];
              }
            });
          });
        }),
        (t.prototype.componentDidMount = function () {
          this.loadPassage();
        }),
        (t.prototype.render = function (e, t) {
          var n = t.content;
          return t.error
            ? g(W, null)
            : n && n.passage
            ? g(
                "div",
                { className: "scripture-styles gb-passage" },
                g("h1", { className: "mt3 gb-passage-reference" }, n.reference),
                g("div", {
                  className: "gb-passage-content",
                  style: { scriptDirection: n.scriptDirection },
                  dangerouslySetInnerHTML: { __html: n.passage }
                }),
                g("p", { className: "gb-passage-copyright" }, n.copyright)
              )
            : g(G, null);
        }),
        t
      );
    })(v),
    te = Z;
  var ne,
    re,
    ie = (function (e) {
      function t() {
        return (null !== e && e.apply(this, arguments)) || this;
      }
      return (
        n(t, e),
        (t.prototype.render = function (e) {
          return g(
            "p",
            null,
            "This is a reader widget component with ",
            JSON.stringify(e)
          );
        }),
        t
      );
    })(v),
    se = function (e) {
      var t = e.handleSubmit,
        n = e.placeholder,
        r = e.query,
        i = e.handleChange;
      return g(
        "form",
        { onSubmit: t },
        g(
          "div",
          { className: "gb-search-input-container" },
          g(
            "svg",
            {
              width: "23",
              height: "22",
              viewBox: "0 0 23 22",
              xmlns: "http://www.w3.org/2000/svg"
            },
            g("path", {
              d:
                "M20.998 21.5275L15.121 15.6275C14.1473 16.4533 13.0069 17.0592 11.7776 17.4039C10.5483 17.7485 9.25915 17.8237 7.99812 17.6244C6.73709 17.4251 5.53394 16.956 4.47085 16.2491C3.40777 15.5421 2.50979 14.6141 1.83827 13.5283C1.16675 12.4425 0.737502 11.2245 0.579855 9.95759C0.422208 8.69069 0.539875 7.40468 0.924817 6.18742C1.30976 4.97015 1.95291 3.85032 2.81033 2.90441C3.66774 1.95851 4.71923 1.20881 5.89296 0.706545C6.96354 0.250716 8.11359 0.0107303 9.27713 0.000351678C10.4407 -0.0100269 11.5948 0.209406 12.6734 0.646065C13.7519 1.08272 14.7336 1.72802 15.5622 2.54493C16.3908 3.36185 17.05 4.33431 17.502 5.40655C18.1466 6.93017 18.3548 8.60308 18.1031 10.2382C17.8515 11.8734 17.1499 13.4063 16.077 14.6655L21.956 20.5655C22.227 20.7565 22.811 21.3815 22.294 21.8325C21.777 22.2835 21.125 21.6555 20.998 21.5275ZM9.35496 1.35454C7.85843 1.35841 6.39715 1.80907 5.15839 2.64875C3.91963 3.48842 2.95981 4.67888 2.40196 6.06754C1.65649 7.91667 1.67437 9.9859 2.45168 11.8219C3.22899 13.6578 4.70235 15.1108 6.54896 15.8625C7.90708 16.4106 9.39604 16.5488 10.8318 16.26C12.2676 15.9712 13.5874 15.2681 14.628 14.2375C14.6474 14.2113 14.6707 14.188 14.697 14.1685C15.7389 13.1034 16.4427 11.7541 16.7199 10.2901C16.9971 8.82611 16.8353 7.31285 16.255 5.94055C15.6814 4.58365 14.7214 3.4254 13.4946 2.60998C12.2677 1.79455 10.8281 1.35796 9.35496 1.35454Z",
              fill: "black"
            })
          ),
          g("input", {
            className: "gb-search-input",
            name: "global-bible-query",
            type: "text",
            placeholder: n,
            autocomplete: "off",
            value: r,
            onChange: i
          })
        )
      );
    },
    oe = [],
    le = o.__r;
  o.__r = function (e) {
    le && le(e), (ne = 0), (re = e.__c).__H && (re.__H.t = ye(re.__H.t));
  };
  var ae = o.diffed;
  o.diffed = function (e) {
    ae && ae(e);
    var t = e.__c;
    if (t) {
      var n = t.__H;
      n &&
        ((n.u =
          (n.u.some(function (e) {
            e.ref && (e.ref.current = e.createHandle());
          }),
          [])),
        (n.i = ye(n.i)));
    }
  };
  var ce = o.unmount;
  function ue(e) {
    o.__h && o.__h(re);
    var t = re.__H || (re.__H = { o: [], t: [], i: [], u: [] });
    return e >= t.o.length && t.o.push({}), t.o[e];
  }
  function pe(e, t, n) {
    var r = ue(ne++);
    return (
      r.__c ||
        ((r.__c = re),
        (r.v = [
          n ? n(t) : ve(null, t),
          function (t) {
            var n = e(r.v[0], t);
            r.v[0] !== n && ((r.v[0] = n), r.__c.setState({}));
          }
        ])),
      r.v
    );
  }
  function fe(e, t) {
    var n = ue(ne++);
    return _e(n.l, t) ? ((n.l = t), (n.m = e), (n.v = e())) : n.v;
  }
  o.unmount = function (e) {
    ce && ce(e);
    var t = e.__c;
    if (t) {
      var n = t.__H;
      n &&
        n.o.forEach(function (e) {
          return e.p && e.p();
        });
    }
  };
  var de = function () {};
  function he() {
    oe.some(function (e) {
      (e.s = !1), e.__P && (e.__H.t = ye(e.__H.t));
    }),
      (oe = []);
  }
  if ("undefined" != typeof window) {
    var me = o.requestAnimationFrame;
    de = function (e) {
      ((!e.s && (e.s = !0) && 1 === oe.push(e)) ||
        me !== o.requestAnimationFrame) &&
        ((me = o.requestAnimationFrame),
        (
          o.requestAnimationFrame ||
          function (e) {
            var t = function () {
                clearTimeout(n), cancelAnimationFrame(r), setTimeout(e);
              },
              n = setTimeout(t, 100),
              r = requestAnimationFrame(t);
          }
        )(he));
    };
  }
  function ye(e) {
    return e.forEach(ge), e.forEach(Ce), [];
  }
  function ge(e) {
    e.p && e.p();
  }
  function Ce(e) {
    var t = e.v();
    "function" == typeof t && (e.p = t);
  }
  function _e(e, t) {
    return (
      !e ||
      t.some(function (t, n) {
        return t !== e[n];
      })
    );
  }
  function ve(e, t) {
    return "function" == typeof t ? t(e) : t;
  }
  var be = Object.freeze({
    __proto__: null,
    useState: function (e) {
      return pe(ve, e);
    },
    useReducer: pe,
    useEffect: function (e, t) {
      var n = ue(ne++);
      _e(n.l, t) && ((n.v = e), (n.l = t), re.__H.t.push(n), de(re));
    },
    useLayoutEffect: function (e, t) {
      var n = ue(ne++);
      _e(n.l, t) && ((n.v = e), (n.l = t), re.__H.i.push(n));
    },
    useRef: function (e) {
      return fe(function () {
        return { current: e };
      }, []);
    },
    useImperativeHandle: function (e, t, n) {
      var r = ue(ne++);
      _e(r.l, n) && ((r.l = n), re.__H.u.push({ ref: e, createHandle: t }));
    },
    useMemo: fe,
    useCallback: function (e, t) {
      return fe(function () {
        return e;
      }, t);
    },
    useContext: function (e) {
      var t = re.context[e.__c];
      if (!t) return e.__p;
      var n = ue(ne++);
      return null == n.v && ((n.v = !0), t.sub(re)), t.props.value;
    },
    useDebugValue: function (e, t) {
      o.useDebugValue && o.useDebugValue(t ? t(e) : e);
    }
  });
  function we(e, t) {
    for (var n in t) e[n] = t[n];
    return e;
  }
  function xe(e) {
    var t = e.parentNode;
    t && t.removeChild(e);
  }
  var ke = o.__e;
  function Le() {
    this.t = [];
  }
  (o.__e = function (e, t, n) {
    if (e.then && n)
      for (var r, i = t; (i = i.__p); )
        if ((r = i.__c) && r.i)
          return n && ((t.__e = n.__e), (t.__k = n.__k)), void r.i(e);
    ke(e, t, n);
  }),
    ((Le.prototype = new v()).i = function (e) {
      var t = this;
      t.t.push(e);
      var n = function () {
        (t.t[t.t.indexOf(e)] = t.t[t.t.length - 1]),
          t.t.pop(),
          0 == t.t.length &&
            (O(t.props.fallback),
            (t.__v.__e = null),
            (t.__v.__k = t.state.u),
            t.setState({ u: null }));
      };
      null == t.state.u &&
        (t.setState({ u: t.__v.__k }),
        (function e(t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            null != r &&
              ("function" != typeof r.type && r.__e
                ? xe(r.__e)
                : r.__k && e(r.__k));
          }
        })(t.__v.__k),
        (t.__v.__k = [])),
        e.then(n, n);
    }),
    (Le.prototype.render = function (e, t) {
      return t.u ? e.fallback : e.children;
    });
  var Se =
      ("undefined" != typeof Symbol &&
        Symbol.for &&
        Symbol.for("react.element")) ||
      60103,
    Ee = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vector|vert|word|writing|x)[A-Z]/,
    Me = o.event;
  function Ne(e, t, n) {
    if (null == t.__k) for (; t.firstChild; ) xe(t.firstChild);
    return R(e, t), "function" == typeof n && n(), e ? e.__c : null;
  }
  o.event = function (e) {
    return Me && (e = Me(e)), (e.persist = function () {}), (e.nativeEvent = e);
  };
  var Te = function () {};
  function Ae(e) {
    var t = this,
      n = e.container,
      r = g(Te, { context: t.context }, e.vnode);
    return (
      t.l &&
        t.l !== n &&
        (t.s.parentNode && t.l.removeChild(t.s), O(t.v), (t.p = !1)),
      e.vnode
        ? t.p
          ? ((n.__k = t.__k), R(r, n), (t.__k = n.__k))
          : ((t.s = document.createTextNode("")),
            j("", n),
            n.insertBefore(t.s, n.firstChild),
            (t.p = !0),
            (t.l = n),
            R(r, n, t.s),
            (t.__k = this.s.__k))
        : t.p && (t.s.parentNode && t.l.removeChild(t.s), O(t.v)),
      (t.v = r),
      (t.componentWillUnmount = function () {
        t.s.parentNode && t.l.removeChild(t.s), O(t.v);
      }),
      null
    );
  }
  function Pe(e, t) {
    return g(Ae, { vnode: e, container: t });
  }
  (Te.prototype.getChildContext = function () {
    return this.props.context;
  }),
    (Te.prototype.render = function (e) {
      return e.children;
    });
  var Oe = function (e, t) {
      return e ? L(e).map(t) : null;
    },
    He = {
      map: Oe,
      forEach: Oe,
      count: function (e) {
        return e ? L(e).length : 0;
      },
      only: function (e) {
        if (1 !== (e = L(e)).length)
          throw new Error("Children.only() expects only one child.");
        return e[0];
      },
      toArray: L
    };
  function Re() {
    for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
    var n = g.apply(void 0, e),
      r = n.type,
      i = n.props;
    return (
      "function" != typeof r &&
        (i.defaultValue &&
          (i.value || 0 === i.value || (i.value = i.defaultValue),
          delete i.defaultValue),
        Array.isArray(i.value) &&
          i.multiple &&
          "select" === r &&
          (L(i.children).forEach(function (e) {
            -1 != i.value.indexOf(e.props.value) && (e.props.selected = !0);
          }),
          delete i.value),
        (function (e, t) {
          var n, r, i;
          for (i in t) if ((n = Ee.test(i))) break;
          if (n)
            for (i in ((r = e.props = {}), t))
              r[Ee.test(i) ? i.replace(/([A-Z0-9])/, "-$1").toLowerCase() : i] =
                t[i];
        })(n, i)),
      (n.preactCompatNormalized = !1),
      je(n)
    );
  }
  function je(e) {
    return (
      (e.preactCompatNormalized = !0),
      (function (e) {
        var t = e.props;
        (t.class || t.className) &&
          ((De.enumerable = "className" in t),
          t.className && (t.class = t.className),
          Object.defineProperty(t, "className", De));
      })(e),
      e
    );
  }
  function qe(e) {
    return !!e && e.$$typeof === Se;
  }
  var De = {
    configurable: !0,
    get: function () {
      return this.class;
    }
  };
  function ze(e, t) {
    for (var n in e) if (!(n in t)) return !0;
    for (var r in t) if (e[r] !== t[r]) return !0;
    return !1;
  }
  var Be = (function (e) {
    function t(t) {
      e.call(this, t), (this.isPureReactComponent = !0);
    }
    return (
      e && (t.__proto__ = e),
      ((t.prototype = Object.create(e && e.prototype)).constructor = t),
      (t.prototype.shouldComponentUpdate = function (e, t) {
        return ze(this.props, e) || ze(this.state, t);
      }),
      t
    );
  })(v);
  function Je(e, t) {
    Object.defineProperty(e.prototype, "UNSAFE_" + t, {
      configurable: !0,
      get: function () {
        return this[t];
      },
      set: function (e) {
        this[t] = e;
      }
    });
  }
  (v.prototype.isReactComponent = {}),
    Je(v, "componentWillMount"),
    Je(v, "componentWillReceiveProps"),
    Je(v, "componentWillUpdate");
  var Ue = o.vnode;
  o.vnode = function (e) {
    (e.$$typeof = Se),
      (function (t) {
        var n = e.type,
          r = e.props;
        if (r && "string" == typeof n) {
          var i = {};
          for (var s in r)
            /^on(Ani|Tra)/.test(s) &&
              ((r[s.toLowerCase()] = r[s]), delete r[s]),
              (i[s.toLowerCase()] = s);
          if (
            (i.ondoubleclick &&
              ((r.ondblclick = r[i.ondoubleclick]), delete r[i.ondoubleclick]),
            i.onbeforeinput &&
              ((r.onbeforeinput = r[i.onbeforeinput]),
              delete r[i.onbeforeinput]),
            i.onchange &&
              ("textarea" === n ||
                ("input" === n.toLowerCase() && !/^fil|che|ra/i.test(r.type))))
          ) {
            var o = i.oninput || "oninput";
            r[o] || ((r[o] = r[i.onchange]), delete r[i.onchange]);
          }
        }
      })();
    var t = e.type;
    t && t.o && e.ref && ((e.props.ref = e.ref), (e.ref = null)), Ue && Ue(e);
  };
  we(
    {
      version: "16.8.0",
      Children: He,
      render: Ne,
      hydrate: Ne,
      unmountComponentAtNode: function (e) {
        return !!e.__k && (R(null, e), !0);
      },
      createPortal: Pe,
      createElement: Re,
      createContext: function (e) {
        var t = {},
          n = {
            __c: "__cC" + p++,
            __p: e,
            Consumer: function (e, t) {
              return (
                (this.shouldComponentUpdate = function (e, n, r) {
                  return r !== t;
                }),
                e.children(t)
              );
            },
            Provider: function (e) {
              var r,
                i = this;
              return (
                this.getChildContext ||
                  ((r = []),
                  (this.getChildContext = function () {
                    return (t[n.__c] = i), t;
                  }),
                  (this.shouldComponentUpdate = function (e) {
                    r.some(function (t) {
                      t.__P && ((t.context = e.value), w(t));
                    });
                  }),
                  (this.sub = function (e) {
                    r.push(e);
                    var t = e.componentWillUnmount;
                    e.componentWillUnmount = function () {
                      r.splice(r.indexOf(e), 1), t && t.call(e);
                    };
                  })),
                e.children
              );
            }
          };
        return (n.Consumer.contextType = n), n;
      },
      createFactory: function (e) {
        return Re.bind(null, e);
      },
      cloneElement: function (e) {
        return qe(e) ? je(q.apply(null, arguments)) : e;
      },
      createRef: function () {
        return {};
      },
      Fragment: _,
      isValidElement: qe,
      findDOMNode: function (e) {
        return (e && (e.base || (1 === e.nodeType && e))) || null;
      },
      Component: v,
      PureComponent: Be,
      memo: function (e, t) {
        function n(e) {
          var n = this.props.ref,
            r = n == e.ref;
          return (
            !r && n && (n.call ? n(null) : (n.current = null)),
            (t ? !t(this.props, e) : ze(this.props, e)) || !r
          );
        }
        function r(t) {
          return (this.shouldComponentUpdate = n), g(e, we({}, t));
        }
        return (
          (r.prototype.isReactComponent = !0),
          (r.displayName = "Memo(" + (e.displayName || e.name) + ")"),
          (r.o = !0),
          r
        );
      },
      forwardRef: function (e) {
        function t(t) {
          var n = t.ref;
          return delete t.ref, e(t, n);
        }
        return (
          (t.prototype.isReactComponent = !0),
          (t.o = !0),
          (t.displayName = "ForwardRef(" + (e.displayName || e.name) + ")"),
          t
        );
      },
      unstable_batchedUpdates: function (e, t) {
        return e(t);
      },
      Suspense: Le,
      lazy: function (e) {
        var t, n, r;
        function i(i) {
          if (
            (t ||
              (t = e()).then(
                function (e) {
                  n = e.default;
                },
                function (e) {
                  r = e;
                }
              ),
            r)
          )
            throw r;
          if (!n) throw t;
          return g(n, i);
        }
        return (i.displayName = "Lazy"), (i.o = !0), i;
      }
    },
    be
  );
  $(
    ".gb-modal-wrapper {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  background-color: rgba(0, 0, 0, 0.5);\n  z-index: 9999; /* TODO: talk to Dallas about making sure our modal is always on top */\n}\n.gb-modal-container {\n  box-sizing: border-box;\n  background: white;\n  border: 1px solid #e0e0e0;\n  box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.07);\n  border-radius: 4px;\n  padding: 24px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  max-width: 700px;\n  width: 100%;\n  max-height: calc(100vh - 80px);\n  height: 500px;\n}\n\n.gb-modal-content {\n  height: 100%;\n  overflow-y: scroll;\n}\n\n@media (max-width: 748px) {\n  .gb-modal-content {\n    width: calc(100% - 48px);\n  }\n}\n\n.gb-modal-close-icon {\n  height: 16px;\n  width: 16px;\n  padding: 10px;\n  position: absolute;\n  top: -18px;\n  right: -18px;\n  fill: white;\n  background: #111;\n  border-radius: 100%;\n  box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.07);\n}\n"
  );
  var Ze = (function (e) {
      function t(t) {
        var n = e.call(this, t) || this,
          r = document.getElementById("gb-modal");
        if (!r) {
          var i = document.createElement("div");
          i.setAttribute("id", "gb-modal"), (r = i);
        }
        return (n.el = r), n;
      }
      return (
        n(t, e),
        (t.prototype.componentDidMount = function () {
          document.body.appendChild(this.el);
        }),
        (t.prototype.componentWillUnmount = function () {
          document.body.removeChild(this.el);
        }),
        (t.prototype.render = function (e) {
          return Pe(
            g(
              "div",
              { className: "gb-modal-wrapper", onClick: e.handleClose },
              g(
                "div",
                {
                  onClick: function (e) {
                    return e.stopPropagation();
                  },
                  className: "gb-modal-container " + (e.className || "")
                },
                g(
                  "div",
                  { className: "gb-modal-content" },
                  g(Ve, {
                    className: "gb-modal-close-icon",
                    onClick: e.handleClose
                  }),
                  e.children
                )
              )
            ),
            this.el
          );
        }),
        t
      );
    })(v),
    Ve = function (e) {
      return g(
        "svg",
        r({ viewBox: "0 0 12 12", xmlns: "http://www.w3.org/2000/svg" }, e),
        g("path", {
          d:
            "M7.14994 6.08952C7.1383 6.07791 7.12907 6.06412 7.12276 6.04893C7.11646 6.03374 7.11322 6.01746 7.11322 6.00102C7.11322 5.98458 7.11646 5.9683 7.12276 5.95311C7.12907 5.93793 7.1383 5.92413 7.14994 5.91252L11.7814 1.28152C11.9221 1.14069 12.001 0.949764 12.0009 0.750741C12.0007 0.551718 11.9215 0.360903 11.7807 0.220272C11.6399 0.0796407 11.4489 0.00071403 11.2499 0.00085468C11.0509 0.00099533 10.8601 0.0801918 10.7194 0.221022L6.08844 4.85002C6.07683 4.86166 6.06304 4.8709 6.04785 4.8772C6.03266 4.8835 6.01638 4.88675 5.99994 4.88675C5.9835 4.88675 5.96722 4.8835 5.95203 4.8772C5.93685 4.8709 5.92305 4.86166 5.91144 4.85002L1.28044 0.221022C1.21081 0.151355 1.12813 0.0960867 1.03714 0.0583711C0.946149 0.0206554 0.848618 0.00123144 0.750118 0.00120822C0.551189 0.00116134 0.360389 0.0801407 0.219692 0.220772C0.0789941 0.361403 -7.51653e-05 0.552166 -0.000122049 0.751095C-0.000168934 0.950024 0.0788104 1.14082 0.219442 1.28152L4.84994 5.91252C4.86158 5.92413 4.87082 5.93793 4.87712 5.95311C4.88342 5.9683 4.88667 5.98458 4.88667 6.00102C4.88667 6.01746 4.88342 6.03374 4.87712 6.04893C4.87082 6.06412 4.86158 6.07791 4.84994 6.08952L0.219442 10.721C0.149808 10.7907 0.0945783 10.8734 0.0569055 10.9644C0.0192327 11.0554 -0.000145264 11.1529 -0.000122049 11.2514C-7.51653e-05 11.4504 0.0789941 11.6411 0.219692 11.7818C0.289358 11.8514 0.372057 11.9066 0.463068 11.9443C0.554079 11.982 0.651619 12.0014 0.750118 12.0013C0.949048 12.0013 1.13981 11.9222 1.28044 11.7815L5.91144 7.15002C5.92305 7.13838 5.93685 7.12915 5.95203 7.12284C5.96722 7.11654 5.9835 7.1133 5.99994 7.1133C6.01638 7.1133 6.03266 7.11654 6.04785 7.12284C6.06304 7.12915 6.07683 7.13838 6.08844 7.15002L10.7194 11.7815C10.8601 11.9222 11.0508 12.0013 11.2498 12.0013C11.4487 12.0014 11.6395 11.9224 11.7802 11.7818C11.9209 11.6411 12 11.4504 12 11.2514C12.0001 11.0525 11.9211 10.8617 11.7804 10.721L7.14994 6.08952Z"
        })
      );
    },
    Ie = function (e) {
      var t = e.iframeSrc,
        n = e.handleClose;
      return g(
        Ze,
        { handleClose: n, className: "gb-search-modal-content" },
        t &&
          g("iframe", {
            className: "gb-search-modal-result",
            frameBorder: "0",
            scrolling: "yes",
            src: t
          })
      );
    };
  $(
    ".gb-search-input-container {\n  border: 1px solid #dcdcdc;\n  box-shadow: 1px 3px 3px rgba(0, 0, 0, 0.05);\n  border-radius: 9999px;\n  background: white;\n  display: flex;\n  align-items: center;\n  z-index: 10;\n  padding: 0rem 1rem;\n}\n\n.gb-search-input {\n  border: none;\n  outline: none;\n  background: transparent;\n  height: 3rem;\n  width: 100%;\n  padding: 0rem 1rem;\n  font-size: 1rem;\n}\n\n.gb-search-logo-container {\n  display: flex;\n  justify-content: flex-end;\n  padding: 0.7rem 1rem;\n}\n\n.gb-search-modal-content {\n  padding: 0;\n  height: calc(100vh - 80px);\n}\n\n.gb-search-modal-result {\n  border-radius: 4px;\n  height: 100%;\n  width: 100%;\n}\n\n.gb-search-result-blocked {\n  font-size: 14px;\n  padding: 0;\n}\n"
  );
  var Fe,
    We = function () {
      return r(r({}, Z()), { placeholder: "Search the Bible" });
    };
  !(function (e) {
    (e[(e.FORM = 0)] = "FORM"),
      (e[(e.RESULTS = 1)] = "RESULTS"),
      (e[(e.FAILED = 2)] = "FAILED"),
      (e[(e.BLOCKED = 3)] = "BLOCKED");
  })(Fe || (Fe = {}));
  var Ge = (function (e) {
      function t() {
        var t = (null !== e && e.apply(this, arguments)) || this;
        return (
          (t.state = { mode: Fe.FORM, query: "" }),
          (t.onSubmit = function (e) {
            return (
              e.preventDefault(),
              t.state.query
                ? (console.log("search display", t.props),
                  t.props.display === J.TAB
                    ? t.showResultInTab()
                    : void t.setState({ mode: Fe.RESULTS }))
                : t.setState({ mode: Fe.FORM })
            );
          }),
          (t.onInput = function (e) {
            var n = e.target;
            n && t.setState({ query: n.value });
          }),
          t
        );
      }
      return (
        n(t, e),
        (t.prototype.showResultInTab = function () {
          var e =
              F(this.props) +
              "/bible/" +
              this.props.bible +
              "/search?q=" +
              encodeURIComponent(this.state.query),
            t = window.open(e),
            n = !t || t.closed || void 0 === t.closed;
          return this.setState({ mode: n ? Fe.BLOCKED : Fe.FORM });
        }),
        (t.prototype.render = function (e, t) {
          var n = this;
          return g(
            _,
            null,
            g(se, {
              handleSubmit: this.onSubmit,
              placeholder: e.placeholder,
              query: t.query,
              handleChange: this.onInput
            }),
            g(
              "div",
              { className: "gb-search-logo-container" },
              g(
                "div",
                null,
                t.mode === Fe.BLOCKED && g(Ke, { url: "http://google.com" })
              ),
              g($e, null)
            ),
            t.mode === Fe.RESULTS &&
              g(Ie, {
                handleClose: function () {
                  return n.setState({ mode: Fe.FORM });
                },
                iframeSrc:
                  F(this.props) +
                  "/search/" +
                  encodeURIComponent(t.query) +
                  "?q=" +
                  t.query +
                  "&embed=true&embedInit=true"
              })
          );
        }),
        t
      );
    })(v),
    Ke = function (e) {
      return g(
        "p",
        { className: "gb-search-result-blocked" },
        "Your browser has blocked pop-ups from this site. You can",
        " ",
        g("a", { href: e.url, target: "_blank" }, "view results here"),
        "."
      );
    },
    $e = function () {
      return g(
        "svg",
        {
          width: "100",
          height: "19",
          viewBox: "0 0 100 19",
          xmlns: "http://www.w3.org/2000/svg"
        },
        g("path", {
          d:
            "M31.5666 13.4619V8.01309H26.3431V9.7853H29.6472C29.5066 10.4072 29.1446 10.9568 28.6289 11.3316C28.1131 11.7065 27.4786 11.8811 26.8437 11.8228C26.3834 11.8292 25.927 11.7384 25.5042 11.5565C25.0814 11.3745 24.7017 11.1054 24.3899 10.7668C24.0781 10.4282 23.8412 10.0276 23.6947 9.59125C23.5482 9.15489 23.4953 8.69254 23.5396 8.23436C23.498 7.77906 23.5526 7.32011 23.6998 6.88725C23.847 6.4544 24.0835 6.0573 24.3939 5.72171C24.7044 5.38611 25.082 5.11951 25.5021 4.93918C25.9222 4.75885 26.3755 4.66882 26.8327 4.67492C27.4626 4.64082 28.0855 4.82069 28.6003 5.18532C29.115 5.54994 29.4914 6.0779 29.6682 6.68342L31.6177 5.98956C31.2869 5.00032 30.6383 4.14824 29.7728 3.56602C28.9074 2.98379 27.8737 2.70412 26.8327 2.77054C26.1162 2.75694 25.4045 2.88976 24.7411 3.16086C24.0778 3.43197 23.4767 3.83565 22.9749 4.34718C22.473 4.85871 22.0808 5.46732 21.8224 6.13573C21.564 6.80413 21.4448 7.51826 21.472 8.23436C21.4316 8.9413 21.5373 9.64897 21.7824 10.3133C22.0276 10.9776 22.4069 11.5843 22.8968 12.0956C23.3866 12.6069 23.9766 13.0118 24.6298 13.2851C25.283 13.5584 25.9855 13.6942 26.6935 13.6842C27.2849 13.7197 27.876 13.609 28.4144 13.3617C28.9528 13.1144 29.422 12.7382 29.7804 12.2664L29.9135 13.4629L31.5666 13.4619ZM35.4354 13.4619V2.77054H33.472V13.4619H35.4354ZM40.7971 11.9009C40.5361 11.8987 40.2784 11.842 40.0407 11.7343C39.8029 11.6267 39.5902 11.4705 39.4164 11.2758C39.2425 11.0811 39.1113 10.8522 39.0311 10.6038C38.9509 10.3554 38.9236 10.093 38.9508 9.83336C38.9223 9.57352 38.9488 9.3106 39.0285 9.06165C39.1082 8.8127 39.2393 8.5833 39.4134 8.38833C39.5876 8.19335 39.8007 8.03717 40.0391 7.92992C40.2775 7.82267 40.5357 7.76675 40.7971 7.76578C41.0585 7.76675 41.3168 7.82267 41.5552 7.92992C41.7935 8.03717 42.0067 8.19335 42.1808 8.38833C42.3549 8.5833 42.4861 8.8127 42.5658 9.06165C42.6455 9.3106 42.6719 9.57352 42.6434 9.83336C42.6719 10.0932 42.6455 10.3561 42.5658 10.6051C42.4861 10.854 42.3549 11.0834 42.1808 11.2784C42.0067 11.4734 41.7935 11.6295 41.5552 11.7368C41.3168 11.844 41.0585 11.9 40.7971 11.9009ZM40.7971 5.97954C40.2896 5.96719 39.7849 6.05881 39.3142 6.24875C38.8434 6.43868 38.4164 6.72293 38.0596 7.084C37.7027 7.44508 37.4235 7.87534 37.2391 8.34833C37.0547 8.82132 36.9691 9.32703 36.9874 9.83436C36.9702 10.3414 37.0567 10.8466 37.2415 11.319C37.4263 11.7915 37.7056 12.2213 38.0622 12.5821C38.4188 12.943 38.8453 13.2273 39.3155 13.4176C39.7858 13.6079 40.2899 13.7004 40.7971 13.6892C41.3043 13.7004 41.8085 13.6079 42.2787 13.4176C42.749 13.2273 43.1755 12.943 43.5321 12.5821C43.8887 12.2213 44.1679 11.7915 44.3527 11.319C44.5376 10.8466 44.624 10.3414 44.6069 9.83436C44.6258 9.3267 44.5405 8.82055 44.3564 8.34709C44.1722 7.87363 43.8931 7.44287 43.5362 7.08137C43.1793 6.71986 42.7521 6.43525 42.2811 6.24507C41.81 6.05489 41.305 5.96316 40.7971 5.97554V5.97954ZM48.0632 13.4669V12.5808C48.3015 12.9277 48.6248 13.2076 49.0023 13.3938C49.3797 13.58 49.7986 13.6662 50.2189 13.6441C52.2865 13.6441 53.6452 12.0051 53.6452 9.80432C53.6452 7.64863 52.4196 6.00858 50.293 6.00858C49.873 5.98174 49.4529 6.05783 49.069 6.23022C48.6851 6.40261 48.3492 6.66611 48.0902 6.99782V2.77455H46.1578V13.4659L48.0632 13.4669ZM51.6817 9.81934C51.7147 10.0764 51.6928 10.3375 51.6175 10.5855C51.5423 10.8334 51.4153 11.0626 51.2451 11.258C51.0748 11.4533 50.865 11.6104 50.6297 11.7188C50.3943 11.8272 50.1386 11.8845 49.8795 11.8869C49.6204 11.8824 49.3652 11.8238 49.1301 11.7149C48.895 11.6061 48.6852 11.4493 48.5143 11.2546C48.3433 11.06 48.2148 10.8318 48.1372 10.5846C48.0595 10.3375 48.0343 10.0768 48.0632 9.81934C48.0332 9.56244 48.0577 9.3021 48.1352 9.05532C48.2126 8.80854 48.3412 8.58087 48.5126 8.38717C48.684 8.19347 48.8944 8.0381 49.1299 7.9312C49.3654 7.8243 49.6208 7.76827 49.8795 7.76678C50.1372 7.76761 50.3919 7.82316 50.6266 7.92975C50.8613 8.03633 51.0707 8.19153 51.241 8.38508C51.4113 8.57863 51.5385 8.80612 51.6143 9.0525C51.6901 9.29888 51.7127 9.55855 51.6807 9.81433L51.6817 9.81934ZM54.7535 11.4884C54.7669 11.7983 54.843 12.1022 54.9772 12.3818C55.1113 12.6614 55.3008 12.9109 55.5341 13.1152C55.7674 13.3195 56.0397 13.4743 56.3346 13.5704C56.6295 13.6665 56.9408 13.7018 57.2497 13.6742C57.6687 13.6934 58.0857 13.6037 58.4598 13.4138C58.8339 13.224 59.1524 12.9404 59.3843 12.5908C59.3831 12.8828 59.4079 13.1743 59.4584 13.4619H61.2607C61.2041 13.0806 61.1746 12.6959 61.1726 12.3104V8.73699C61.1726 7.27517 60.3165 5.97554 58.0126 5.97554C57.2873 5.90792 56.5633 6.11681 55.9855 6.56037C55.4077 7.00393 55.0188 7.64941 54.8967 8.36753L56.6389 8.73699C56.6665 8.39638 56.8281 8.08064 57.0883 7.85912C57.3485 7.63759 57.686 7.5284 58.0266 7.55551C58.8537 7.55551 59.2522 7.98405 59.2522 8.50069C59.2522 8.75201 59.119 8.95826 58.7055 9.01734L56.9182 9.28267C56.3436 9.3011 55.798 9.53992 55.3947 9.94963C54.9913 10.3593 54.761 10.9085 54.7515 11.4834L54.7535 11.4884ZM57.6632 12.2123C57.5446 12.2254 57.4245 12.2133 57.3108 12.177C57.1971 12.1407 57.0924 12.081 57.0033 12.0016C56.9141 11.9222 56.8427 11.825 56.7936 11.7162C56.7444 11.6075 56.7187 11.4896 56.718 11.3703C56.7185 11.1301 56.8131 10.8998 56.9816 10.7286C57.1501 10.5575 57.379 10.4593 57.6191 10.4551L59.2582 10.2038V10.5282C59.2898 10.749 59.2711 10.974 59.2032 11.1865C59.1354 11.399 59.0204 11.5933 58.8667 11.7549C58.713 11.9165 58.5247 12.0411 58.3159 12.1195C58.1071 12.1979 57.8832 12.2279 57.6612 12.2073L57.6632 12.2123ZM65.1205 13.4679V2.77054H63.155V13.4619L65.1205 13.4679ZM67.3633 2.98981V13.4599H71.4093C71.8181 13.5015 72.2311 13.4568 72.6216 13.3288C73.012 13.2008 73.3713 12.9923 73.6761 12.7167C73.9809 12.4412 74.2245 12.1047 74.3911 11.7291C74.5577 11.3535 74.6437 10.9471 74.6434 10.5362C74.6632 9.97527 74.4916 9.42425 74.1568 8.97372C73.822 8.52319 73.3439 8.19996 72.8011 8.05714C73.2575 7.88897 73.6497 7.58196 73.9225 7.17929C74.1953 6.77662 74.335 6.29855 74.322 5.81233C74.322 4.18831 73.1705 2.99182 71.132 2.99182L67.3633 2.98981ZM69.3718 7.31622V4.70195H70.8046C71.7938 4.70195 72.3064 5.20257 72.3064 6.00357C72.3088 6.19239 72.2704 6.3795 72.1938 6.55209C72.1171 6.72467 72.0041 6.87866 71.8624 7.00351C71.7208 7.12836 71.5538 7.22111 71.3729 7.27543C71.1921 7.32974 71.0016 7.34435 70.8146 7.31822L69.3718 7.31622ZM69.3718 11.7608V8.99932H71.0549C71.2523 8.97182 71.4533 8.98791 71.6438 9.04647C71.8343 9.10502 72.0096 9.20463 72.1575 9.33826C72.3053 9.47189 72.4221 9.6363 72.4996 9.81992C72.577 10.0035 72.6133 10.2019 72.6058 10.4011C72.6058 11.2431 72.0151 11.7598 71.0259 11.7598L69.3718 11.7608ZM78.1878 13.4629V6.19381H76.2243V13.4599L78.1878 13.4629ZM75.985 3.81985C75.9895 4.13822 76.1189 4.44207 76.3454 4.6659C76.5718 4.88972 76.8772 5.01559 77.1956 5.01634C77.3539 5.0178 77.511 4.98792 77.6578 4.92844C77.8046 4.86896 77.9382 4.78105 78.0508 4.66976C78.1635 4.55847 78.2531 4.426 78.3144 4.27997C78.3757 4.13393 78.4075 3.97723 78.4081 3.81885C78.4106 3.65837 78.3812 3.499 78.3215 3.34999C78.2619 3.20099 78.1732 3.06534 78.0607 2.95092C77.9481 2.83651 77.8139 2.74562 77.6659 2.68354C77.5179 2.62146 77.3591 2.58943 77.1986 2.58932C77.0383 2.5905 76.8799 2.62324 76.7323 2.68568C76.5847 2.74812 76.4509 2.83903 76.3385 2.95322C76.2261 3.06741 76.1373 3.20263 76.0771 3.35116C76.017 3.49969 75.9867 3.65861 75.988 3.81885L75.985 3.81985ZM82.1878 13.4629V12.5768C82.4261 12.9237 82.7494 13.2036 83.1269 13.3898C83.5043 13.576 83.9232 13.6621 84.3435 13.6401C86.4111 13.6401 87.7698 12.0011 87.7698 9.80031C87.7698 7.64462 86.5442 6.00458 84.4176 6.00458C83.9976 5.97774 83.5775 6.05383 83.1936 6.22622C82.8097 6.39861 82.4737 6.6621 82.2148 6.99381V2.77054H80.2854V13.4619L82.1878 13.4629ZM85.8063 9.81533C85.8393 10.0724 85.8174 10.3335 85.7421 10.5815C85.6669 10.8294 85.5399 11.0586 85.3696 11.254C85.1994 11.4493 84.9896 11.6064 84.7542 11.7148C84.5189 11.8232 84.2632 11.8805 84.0041 11.8829C83.745 11.8784 83.4898 11.8198 83.2547 11.7109C83.0196 11.6021 82.8098 11.4453 82.6389 11.2506C82.4679 11.056 82.3394 10.8278 82.2617 10.5806C82.1841 10.3335 82.1589 10.0728 82.1878 9.81533C82.1578 9.55843 82.1823 9.2981 82.2598 9.05132C82.3372 8.80454 82.4658 8.57686 82.6372 8.38316C82.8086 8.18946 83.0189 8.0341 83.2545 7.92719C83.49 7.82029 83.7454 7.76427 84.0041 7.76277C84.2625 7.76312 84.5178 7.81844 84.7532 7.92508C84.9886 8.03172 85.1986 8.18723 85.3693 8.38128C85.5399 8.57533 85.6673 8.80347 85.743 9.05055C85.8187 9.29763 85.841 9.55799 85.8083 9.81433L85.8063 9.81533ZM91.2851 13.4629V2.77054H89.3217V13.4619L91.2851 13.4629ZM94.8145 9.00332C94.85 8.60183 95.0382 8.22928 95.3405 7.96264C95.6427 7.69599 96.0358 7.55563 96.4386 7.57053C96.6413 7.54772 96.8466 7.56763 97.0412 7.62899C97.2358 7.69034 97.4153 7.79178 97.5683 7.92676C97.7213 8.06174 97.8444 8.22727 97.9295 8.41269C98.0146 8.59811 98.06 8.79931 98.0626 9.00332H94.8145ZM98.2558 10.8937C98.1455 11.2376 97.9221 11.5341 97.6221 11.7351C97.322 11.9361 96.9628 12.0298 96.6028 12.0011C96.1422 12.0182 95.6932 11.8549 95.3512 11.546C95.0091 11.2371 94.8012 10.8069 94.7715 10.347H99.97C99.97 10.317 100 10.0226 100 9.74624C100 7.41333 98.6563 5.98054 96.4115 5.98054C95.9235 5.98988 95.4423 6.09707 94.9965 6.29576C94.5507 6.49446 94.1492 6.78061 93.816 7.13728C93.4828 7.49394 93.2245 7.91385 93.0565 8.37215C92.8886 8.83044 92.8143 9.3178 92.8381 9.80532C92.81 10.3114 92.8867 10.8179 93.0635 11.293C93.2403 11.7681 93.5133 12.2015 93.8654 12.5661C94.2176 12.9308 94.6412 13.2187 95.1098 13.412C95.5785 13.6052 96.082 13.6996 96.5888 13.6892C97.3174 13.7287 98.0384 13.5236 98.6371 13.1063C99.2358 12.689 99.6778 12.0836 99.8929 11.3863L98.2558 10.8937Z",
          fill: "#B2B2B2"
        }),
        g("path", {
          "fill-rule": "evenodd",
          "clip-rule": "evenodd",
          d:
            "M0.937169 0.110208C1.12616 0.0335187 1.3288 -0.00387157 1.53272 0.000316711L1.54667 0.00060341L1.54667 0.000691855C4.90712 0.112333 7.75489 1.43649 9.74986 3.09207C11.7442 1.44117 14.5881 0.120786 17.9429 0.00573796L17.9474 0.00559354C18.1509 -0.000558185 18.3536 0.0347477 18.5431 0.109361C18.7325 0.183975 18.9049 0.29634 19.0495 0.439629C19.1942 0.582917 19.3083 0.754133 19.3847 0.942866C19.4612 1.13159 19.4985 1.3339 19.4943 1.53751C19.4941 1.54976 19.4936 1.56202 19.4929 1.57426L18.8662 13.2018C18.8653 13.2178 18.8641 13.2337 18.8625 13.2496C18.8275 13.6077 18.6662 13.9417 18.4075 14.1917C18.1487 14.4417 17.8094 14.5914 17.4504 14.6141L17.4339 14.6151C14.704 14.7465 12.2812 16.5951 11.1235 17.6345C10.7469 17.979 10.2549 18.1701 9.74438 18.1701C9.2332 18.1701 8.74066 17.9785 8.36388 17.6333C7.20973 16.5911 4.78581 14.7422 2.05662 14.6151L2.10784 13.515L2.0692 14.6156C1.69825 14.6026 1.34525 14.4527 1.0783 14.1948C0.811366 13.9368 0.649398 13.5892 0.623643 13.2189L0.622555 13.2012L0.00178061 1.57369L0.000803778 1.551C-0.00586799 1.34715 0.0290516 1.14408 0.103433 0.954162C0.177814 0.76425 0.290098 0.591475 0.433441 0.446376C0.576783 0.301277 0.748177 0.186897 0.937169 0.110208ZM8.18292 4.65632C8.10044 4.75708 8.02104 4.85805 7.94479 4.95907C7.06212 6.12845 6.4525 7.50714 6.63878 8.74891C6.73926 9.41871 7.07465 10.0326 7.67651 10.4562C8.25259 10.8616 8.97354 11.0238 9.74538 11.0238C10.5175 11.0238 11.2387 10.8612 11.8149 10.4551C12.4167 10.0309 12.7517 9.41652 12.852 8.74662C13.0381 7.50431 12.4291 6.12446 11.5463 4.95365C11.472 4.85515 11.3948 4.75671 11.3146 4.65846C12.7926 3.48335 14.8371 2.50398 17.2501 2.25924L16.6998 12.4677C13.5284 12.8479 10.934 14.8598 9.74462 15.9128C8.55363 14.8534 5.95961 12.843 2.78924 12.4669L2.24397 2.25373C4.65913 2.49697 6.70502 3.47843 8.18292 4.65632ZM9.74767 6.22746C9.76107 6.24491 9.77434 6.26235 9.78749 6.27979C10.5411 7.27931 10.7287 8.05233 10.6736 8.42031C10.6533 8.55556 10.6082 8.61069 10.5458 8.6547C10.4577 8.71677 10.2305 8.82109 9.74538 8.82109C9.2599 8.82109 9.03244 8.71685 8.9443 8.65481C8.88194 8.61092 8.83728 8.5563 8.81716 8.42213C8.76223 8.05595 8.94917 7.28471 9.70291 6.28614C9.71767 6.26659 9.73259 6.24703 9.74767 6.22746Z",
          fill: "#B2B2B2"
        })
      );
    };
  function Xe(e) {
    return (function (e) {
      return e
        .trim()
        .split(",")
        .map(function (e) {
          return e.trim();
        });
    })(e.toLocaleLowerCase()).filter(function (e, t, n) {
      return n.indexOf(e) === t;
    });
  }
  function Ye(e) {
    return e.replace(/([.?*+\^$\[\]\\(){}|\-])/g, "\\$1");
  }
  function Qe(e) {
    var t = (function (e) {
        return e.reduce(function (e, t) {
          return e.concat(Xe(t));
        }, []);
      })(e),
      n = (function (e) {
        for (var t = -1, n = 0; n < e.length; n++)
          if (e.lastIndexOf(e[n]) !== n) {
            t = n;
            break;
          }
        return t > 0 ? e[t] : "";
      })(t);
    if (n) throw new Error("duplicate abbreviation found: " + n);
    return t.map(Ye).join("|");
  }
  var et = "data-gb-link",
    tt = "[" + et + "]",
    nt = (function () {
      function e(e, t) {
        void 0 === t && (t = "MRK"), (this.defaultBook = t);
        this.bookLookup = (function (e) {
          for (var t = {}, n = 0, r = e; n < r.length; n++) {
            var i = Xe(r[n]),
              s = i[0];
            if (!s) throw new Error("blank initial abbreviation found");
            for (var o = 0, l = i; o < l.length; o++) {
              var a = l[o];
              if (t[a]) throw new Error("duplicate abbreviation found: " + a);
              t[a] = s;
            }
          }
          return t;
        })(e);
        var n = Qe(e);
        this.possibleRefChunk = new RegExp(
          [
            "\\b(" + n + ")\\b",
            "([:,\\.\\s\\d]+\\d)",
            "(?:",
            "(?:\\s*-+\\s*)",
            "(?:" + n + ")?\\s*",
            "([:,\\.\\s\\d]+\\d)",
            ")?"
          ].join(""),
          "gi"
        );
      }
      return (
        (e.prototype.linkify = function (e) {
          return e.replace(
            this.possibleRefChunk,
            this.replaceIfLink.bind(this)
          );
        }),
        (e.prototype.getUSXBook = function (e) {
          if (!e.toLowerCase) return "cannot lowercase " + e;
          e = e.toLowerCase();
          var t = this.bookLookup[e];
          return t ? t.toUpperCase() : this.defaultBook;
        }),
        (e.prototype.formatCV = function (e, t) {
          void 0 === t && (t = "");
          var n = function (e) {
              return e ? e.trim().split(/[:,\. ]+/) : [];
            },
            r = n(e),
            i = r[0],
            s = r[1];
          if (((e = i || "1"), s && (e += "." + s), t)) {
            var o = n(t),
              l = o[0],
              a = o[1];
            l && a ? (t = l + "." + a) : s && l && (t = i + "." + l);
          }
          return [e, t];
        }),
        (e.prototype.replaceIfLink = function (e, t, n, r) {
          var i;
          void 0 === r && (r = "");
          var s =
            (t = this.getUSXBook(t)) + "." + (n = (i = this.formatCV(n, r))[0]);
          return (
            (r = i[1]) && (s += "-" + t + "." + r),
            '<a class="gb-link" role="button" href="javascript:;" ' +
              et +
              '="' +
              s +
              '">' +
              e +
              "</a>"
          );
        }),
        e
      );
    })(),
    rt = [
      "GEN,Gen,Genesis,gn",
      "EXO,Exod,Exodus,ex",
      "LEV,Lev,Leviticus,lv",
      "NUM,Num,Numbers,nu",
      "DEU,Deut,Deuteronomy,dt",
      "JOS,Josh,Joshua,js",
      "JDG,Judg,Judges,jg",
      "RUT,Ruth,Ruth,ru",
      "1SA,1Sam,1 Samuel,isam,i samuel,1 s,i s",
      "2SA,2Sam,2 Samuel,iisam,iisa,ii samuel,2 s,ii s",
      "1KI,1Kgs,1 Kings,ikgs,iki,i kings,1 k,i k",
      "2KI,2Kgs,2 Kings,iikgs,iiki,ii kings,2 k,ii k",
      "1CH,1Chr,1 Chronicles,ichr,ich,i chronicles,1 ch,i ch",
      "2CH,2Chr,2 Chronicles,iichr,iich,ii chronicles,2 ch,ii ch",
      "EZR,Ezra,Ezra",
      "NEH,Neh,Nehemiah,ne",
      "EST,Esth,Esther,es",
      "JOB,Job,Job",
      "PSA,Ps,Psalms,psalm",
      "PRO,Prov,Proverbs,pr",
      "ECC,Eccl,Ecclesiastes,ec",
      "SNG,Song,Song of Songs,sgs",
      "ISA,Isa,Isaiah,is",
      "JER,Jer,Jeremiah,jr",
      "LAM,Lam,Lamentations,lm",
      "EZK,Ezek,Ezekiel,ez",
      "DAN,Dan,Daniel,dn",
      "HOS,Hos,Hosea,ho",
      "JOL,Joel,Joel,jl",
      "AMO,Amos,Amos,am",
      "OBA,Obad,Obadiah,ob",
      "JON,Jonah,Jonah",
      "MIC,Mic,Micah",
      "NAM,Nah,Nahum,nh",
      "HAB,Hab,Habakkuk,hb",
      "ZEP,Zeph,Zephaniah",
      "HAG,Hag,Haggai,hg",
      "ZEC,Zech,Zechariah",
      "MAL,Mal,Malachi,ml",
      "MAT,Matt,Matthew,mt",
      "MRK,Mark,Mark,mk",
      "LUK,Luke,Luke,lk",
      "JHN,John,John,jn",
      "ACT,Acts,Acts,ac",
      "ROM,Rom,Romans,ro",
      "1CO,1Cor,1 Corinthians,icor,ico,i corinthians,1 co,i co",
      "2CO,2Cor,2 Corinthians,iicor,iico,ii corinthians,2 co,ii co",
      "GAL,Gal,Galatians,ga",
      "EPH,Eph,Ephesians",
      "PHP,Phil,Philippians",
      "COL,Col,Colossians",
      "1TH,1Thess,1 Thessalonians,ithess,ith,i thessalonians,1 th,i th",
      "2TH,2Thess,2 Thessalonians,iithess,iith,ii thessalonians,2 th,ii th",
      "1TI,1Tim,1 Timothy,itim,iti,i timothy,1 ti,i ti",
      "2TI,2Tim,2 Timothy,iitim,iiti,ii timothy,2 ti,ii ti",
      "TIT,Titus,Titus",
      "PHM,Phlm,Philemon",
      "HEB,Heb,Hebrews,he",
      "JAS,Jas,James",
      "1PE,1Pet,1 Peter,ipet,ipe,i peter,1 p,i p",
      "2PE,2Pet,2 Peter,iipet,iipe,ii peter,2 p,ii p",
      "1JN,1John,1 John,ijohn,ijn,i john,1 jn,i jn",
      "2JN,2John,2 John,iijohn,iijn,ii john,2 jn,ii jn",
      "3JN,3John,3 John,iiijohn,iiijn,iii john,3 jn,iii jn",
      "JUD,Jude,Jude,jd",
      "REV,Rev,Revelation",
      "BAR,Bar,Baruch,ba",
      "BEL,Bel,Bel and the Dragon",
      "SUS,Sus,Susanna,su",
      "1ES,1Esd,1 Esdras,iesd,ies,i esdras,1 esd,i esd",
      "2ES,2Esd,2 Esdras,iiesd,iies,ii esdras,2 esd,ii esd",
      "ESG,AddEsth,Esther (Greek Version),esther gk,gk est",
      "LJE,EpJer,Letter of Jeremiah,let jer",
      "JDT,Jdt,Judith",
      "1MA,1Macc,1 Maccabees,imacc,ima,i maccabees,1 macc,i macc",
      "2MA,2Macc,2 Maccabees,iimacc,iima,ii maccabees,2 macc,ii macc",
      "3MA,3Macc,3 Maccabees,iiimacc,iiima,iii maccabees,3 macc,iii macc",
      "4MA,4Macc,4 Maccabees,ivmacc,ivma,iv maccabees,4 macc,iv macc",
      "MAN,PrMan,Prayer of Manasseh",
      "S3Y,PrAzar,Prayer of Azariah and the Song of the Three Young Men",
      "PS2,Ps151,Psalm 151",
      "SIR,Sir,Sirach,si",
      "TOB,Tob,Tobit,tb",
      "WIS,Wis,Wisdom of Solomon,ws"
    ],
    it = (function () {
      function e(e, t) {
        var n = this;
        void 0 === e && (e = 10),
          void 0 === t && (t = [et]),
          (this.maxDepth = e),
          (this.ignoreDataAttrs = t),
          (this.linkifyTextNodes = function (e) {
            if (e instanceof Text) {
              var t = e.data;
              if (t) {
                var r = n.parser.linkify(t);
                t !== r && n.setTextNodeInnerHTML(e, r);
              }
              return !0;
            }
            return !1;
          }),
          (this.ignoreWidgetNodes = function (e) {
            if (e instanceof HTMLElement)
              for (var t in e.dataset) if (t in n.ignoreDataAttrs) return !0;
            return !1;
          }),
          (this.handleCitation = function (e) {
            return !1;
          }),
          (this.handleAnchor = function (e) {
            return !1;
          }),
          (this.parser = new nt(rt));
      }
      return (
        (e.prototype.autolink = function (e, t) {
          void 0 === t && (t = 0);
          for (var n = 0, r = this.nodeListToArray(e); n < r.length; n++) {
            var i = r[n];
            this.autolinkNode(i, t + 1);
          }
          return !0;
        }),
        (e.prototype.nodeListToArray = function (e) {
          return [].slice.call(e, 0);
        }),
        (e.prototype.autolinkNode = function (e, t) {
          return (
            void 0 === t && (t = 0),
            t > this.maxDepth + 1 ||
              this.ignoreWidgetNodes(e) ||
              this.linkifyTextNodes(e) ||
              this.autolink(e.childNodes, t)
          );
        }),
        (e.prototype.setTextNodeInnerHTML = function (e, t) {
          var n = e.parentNode;
          if (n) {
            var r = document.createElement("span");
            r.innerHTML = t;
            for (
              var i = 0, s = this.nodeListToArray(r.childNodes);
              i < s.length;
              i++
            ) {
              var o = s[i];
              n.insertBefore(o, e);
            }
            n.removeChild(e);
          }
        }),
        e
      );
    })();
  function st(e) {
    new it(10, [et]).autolink(e);
  }
  var ot = (function (e) {
    function t() {
      var t = (null !== e && e.apply(this, arguments)) || this;
      return (t.state = { passage: null, bible: "" }), t;
    }
    return (
      n(t, e),
      (t.prototype.componentDidMount = function () {
        var e = [].slice.call(document.querySelectorAll(tt), 0);
        this.linkNodeTransformer(e);
      }),
      (t.prototype.linkNodeTransformer = function (e) {
        var t = this,
          n = this.props,
          r = n.display,
          i = n.bible;
        console.log("link props", this.props),
          e.forEach(function (e) {
            var n = "A" === e.tagName,
              s = e.getAttribute(et);
            if (r === J.MODAL)
              n && e.setAttribute("href", "javascript:;"),
                (e.onclick = function (e) {
                  e.preventDefault(), t.setState({ passage: s, bible: i });
                });
            else if ("tab" === r) {
              var o = s.split(".").slice(0, 2).join("."),
                l = F(t.props) + "/bible/" + i + "/" + o + "?passageId=" + s;
              n
                ? (e.setAttribute("href", l),
                  e.setAttribute("target", "_blank"))
                : (e.onclick = function (e) {
                    e.preventDefault(), window.open(l);
                  });
            }
          });
      }),
      (t.prototype.closeModal = function () {
        this.setState({ passage: null });
      }),
      (t.prototype.render = function (e, t) {
        var n = this;
        return g(
          _,
          null,
          t.passage &&
            g(
              Ze,
              {
                handleClose: function () {
                  return n.closeModal();
                }
              },
              g(ee, r({}, e, { passage: t.passage, bible: t.bible }))
            )
        );
      }),
      t
    );
  })(v);
  var lt = setTimeout;
  function at(e) {
    return Boolean(e && void 0 !== e.length);
  }
  function ct() {}
  function ut(e) {
    if (!(this instanceof ut))
      throw new TypeError("Promises must be constructed via new");
    if ("function" != typeof e) throw new TypeError("not a function");
    (this._state = 0),
      (this._handled = !1),
      (this._value = void 0),
      (this._deferreds = []),
      yt(e, this);
  }
  function pt(e, t) {
    for (; 3 === e._state; ) e = e._value;
    0 !== e._state
      ? ((e._handled = !0),
        ut._immediateFn(function () {
          var n = 1 === e._state ? t.onFulfilled : t.onRejected;
          if (null !== n) {
            var r;
            try {
              r = n(e._value);
            } catch (e) {
              return void dt(t.promise, e);
            }
            ft(t.promise, r);
          } else (1 === e._state ? ft : dt)(t.promise, e._value);
        }))
      : e._deferreds.push(t);
  }
  function ft(e, t) {
    try {
      if (t === e)
        throw new TypeError("A promise cannot be resolved with itself.");
      if (t && ("object" == typeof t || "function" == typeof t)) {
        var n = t.then;
        if (t instanceof ut) return (e._state = 3), (e._value = t), void ht(e);
        if ("function" == typeof n)
          return void yt(
            ((r = n),
            (i = t),
            function () {
              r.apply(i, arguments);
            }),
            e
          );
      }
      (e._state = 1), (e._value = t), ht(e);
    } catch (t) {
      dt(e, t);
    }
    var r, i;
  }
  function dt(e, t) {
    (e._state = 2), (e._value = t), ht(e);
  }
  function ht(e) {
    2 === e._state &&
      0 === e._deferreds.length &&
      ut._immediateFn(function () {
        e._handled || ut._unhandledRejectionFn(e._value);
      });
    for (var t = 0, n = e._deferreds.length; t < n; t++) pt(e, e._deferreds[t]);
    e._deferreds = null;
  }
  function mt(e, t, n) {
    (this.onFulfilled = "function" == typeof e ? e : null),
      (this.onRejected = "function" == typeof t ? t : null),
      (this.promise = n);
  }
  function yt(e, t) {
    var n = !1;
    try {
      e(
        function (e) {
          n || ((n = !0), ft(t, e));
        },
        function (e) {
          n || ((n = !0), dt(t, e));
        }
      );
    } catch (e) {
      if (n) return;
      (n = !0), dt(t, e);
    }
  }
  (ut.prototype.catch = function (e) {
    return this.then(null, e);
  }),
    (ut.prototype.then = function (e, t) {
      var n = new this.constructor(ct);
      return pt(this, new mt(e, t, n)), n;
    }),
    (ut.prototype.finally = function (e) {
      var t = this.constructor;
      return this.then(
        function (n) {
          return t.resolve(e()).then(function () {
            return n;
          });
        },
        function (n) {
          return t.resolve(e()).then(function () {
            return t.reject(n);
          });
        }
      );
    }),
    (ut.all = function (e) {
      return new ut(function (t, n) {
        if (!at(e)) return n(new TypeError("Promise.all accepts an array"));
        var r = Array.prototype.slice.call(e);
        if (0 === r.length) return t([]);
        var i = r.length;
        function s(e, o) {
          try {
            if (o && ("object" == typeof o || "function" == typeof o)) {
              var l = o.then;
              if ("function" == typeof l)
                return void l.call(
                  o,
                  function (t) {
                    s(e, t);
                  },
                  n
                );
            }
            (r[e] = o), 0 == --i && t(r);
          } catch (e) {
            n(e);
          }
        }
        for (var o = 0; o < r.length; o++) s(o, r[o]);
      });
    }),
    (ut.resolve = function (e) {
      return e && "object" == typeof e && e.constructor === ut
        ? e
        : new ut(function (t) {
            t(e);
          });
    }),
    (ut.reject = function (e) {
      return new ut(function (t, n) {
        n(e);
      });
    }),
    (ut.race = function (e) {
      return new ut(function (t, n) {
        if (!at(e)) return n(new TypeError("Promise.race accepts an array"));
        for (var r = 0, i = e.length; r < i; r++) ut.resolve(e[r]).then(t, n);
      });
    }),
    (ut._immediateFn =
      ("function" == typeof setImmediate &&
        function (e) {
          setImmediate(e);
        }) ||
      function (e) {
        lt(e, 0);
      }),
    (ut._unhandledRejectionFn = function (e) {
      "undefined" != typeof console &&
        console &&
        console.warn("Possible Unhandled Promise Rejection:", e);
    });
  window.Promise || (window.Promise = ut);
  var gt = function () {
      return new Promise(function (e) {
        "loading" === document.readyState
          ? document.addEventListener("DOMContentLoaded", e)
          : e();
      });
    },
    Ct = function (e) {
      return [].slice.call(e, 0);
    },
    _t = function (e) {
      var t = Ct(e.attributes)
        .filter(function (e) {
          return e.name.indexOf("data-") > -1;
        })
        .map(function (e) {
          return [e.name, e.value];
        })
        .reduce(
          function (e, t) {
            var n = t[0],
              r = t[1];
            return (
              (e[
                n
                  .split("-")
                  .slice(1)
                  .map(function (e, t) {
                    return 0 === t ? e : e.charAt(0).toUpperCase() + e.slice(1);
                  })
                  .join("")
              ] = r),
              e
            );
          },
          { gbWidget: "" }
        );
      return [
        t.gbWidget,
        (function (e, t) {
          var n = {};
          for (var r in e)
            Object.prototype.hasOwnProperty.call(e, r) &&
              t.indexOf(r) < 0 &&
              (n[r] = e[r]);
          if (null != e && "function" == typeof Object.getOwnPropertySymbols) {
            var i = 0;
            for (r = Object.getOwnPropertySymbols(e); i < r.length; i++)
              t.indexOf(r[i]) < 0 &&
                Object.prototype.propertyIsEnumerable.call(e, r[i]) &&
                (n[r[i]] = e[r[i]]);
          }
          return n;
        })(t, ["gbWidget"])
      ];
    };
  return (
    (e.init = function (e) {
      return (
        void 0 === e && (e = {}),
        i(void 0, void 0, void 0, function () {
          var t;
          return s(this, function (n) {
            switch (n.label) {
              case 0:
                return [4, gt()];
              case 1:
                return (
                  n.sent(),
                  [
                    4,
                    I(
                      r(r({}, r(r({}, Z()), { autolink: !1, language: "" })), e)
                    )
                  ]
                );
              case 2:
                return (
                  (t = n.sent()),
                  (i = t.autolink) &&
                    ("boolean" == typeof i
                      ? st(document.querySelectorAll("body"))
                      : "string" == typeof i &&
                        st(document.querySelectorAll(i))),
                  R(g(ot, r({}, t)), document.createElement("div")),
                  Ct(document.querySelectorAll("[data-gb-widget]")).forEach(
                    function (e) {
                      var n = _t(e),
                        i = n[0],
                        s = n[1];
                      switch (i) {
                        case "search":
                          return R(
                            (function (e, t) {
                              var n = r(r(r({}, We()), e), t);
                              return g(Ge, r({}, n));
                            })(t, s),
                            e
                          );
                        case "passage":
                          return R(
                            (function (e, t) {
                              var n = r(r(r({}, X()), e), t);
                              return g(ee, r({}, n));
                            })(t, s),
                            e
                          );
                        case "reader":
                          return R(
                            (function (e, t) {
                              var n = r(r(r({}, te()), e), t);
                              return g(ie, r({}, n));
                            })(t, s),
                            e
                          );
                        default:
                          console.error(
                            "The following element has an invalid widget type of " +
                              i +
                              ".\n",
                            e
                          );
                      }
                    }
                  ),
                  [2]
                );
            }
            var i;
          });
        })
      );
    }),
    e
  );
})({});

GLOBALBIBLE.init({
        url: "https://bibles.org",
        bible: "555fef9a6cb31151-01",
    });