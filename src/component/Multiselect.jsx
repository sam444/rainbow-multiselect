import { KeyValue, Component, Event, Param, OnFocusEvent, CodeTable, OnChangeEvent, OnBlurEvent } from "rainbowui-core";
import config from "config";
import { CodeTableService } from "rainbow-foundation-codetable";
import { ComponentContext, PageContext } from "rainbow-foundation-cache";
import { Util } from 'rainbow-foundation-tools';
import PropTypes from 'prop-types';
export default class Multiselect extends KeyValue {
    state = {
        allSelectedText: '',
    }
    renderInput() {
        if (this.props.single) {
            return (
                <select id={this.componentId} class="multiselect" >
                </select>
            );
        } else if (this.props.disabled == 'disabled') {
            return (
                <select id={this.componentId} class="multiselect" multiple="multiple" disabled>
                </select>
            );
        } else {
            return (
                <select id={this.componentId} class="multiselect" multiple="multiple">
                </select>
            );
        }
    }
    initMultiselect() {
        if (this.props.io != "out") {
            this.fillSelectOption();
            this.setMultiselect();
        }
    }
    componentDidUpdate() {
        ComponentContext.put(this.componentId, this);
        super._componentDidUpdate();
        if (this.props.io != "out") {
            this.fillSelectOption();
            this.refreshMultiSelect();
        }
    }
    componentDidMount() {
        this.initMultiselect();

        if (!_.isEmpty(this.props.style)) {
            const selectObject = $("#" + this.componentId);
            const select2Object = $("#select2-" + this.componentId + "-container");
            select2Object.attr("style", selectObject.attr("style"));
        }
    }

    setMultiselect() {
        let _self = this;
        $("#" + this.componentId).multiselect({
            // enableFullValueFiltering: this.props.search ? true : false,//能否全字匹配  
            enableCaseInsensitiveFiltering: Util.parseBool(this.props.search),//不区分大小写 
            enableFiltering: Util.parseBool(this.props.search),
            buttonWidth: this.props.width,
            dropRight: Util.parseBool(this.props.dropRight),
            dropUp: this.props.dropUp,
            maxHeight: this.props.height,
            // buttonContainer: '<span class="glyphicon glyphicon-list-alt"></span>',
            enableClickableOptGroups: true,//同时取组或者all  
            enableCollapsibleOptGroups: true,//组可折叠  
            buttonClass: 'btn btn-' + this.props.type + ' ' + this.getSize(),
            includeSelectAllOption: this.props.selectAll,
            selectAllText: 'Select all',
            selectAllValue: 'multiselect-all',
            nonSelectedText: this.getI18n(this.props.title),
            nSelectedText: ' - Too many options selected!',
            numberDisplayed: this.props.num,
            allSelectedText: this.state.allSelectedText,
            selectAllNumber: Util.parseBool(this.props.selectAllNumber),
            onChange: function (option, checked) {
                _self.limitSelectNum(option, checked);
                _self.setComponentValue();
                if (_self.props.onChange) {
                    _self.onChangeCallback(_self);
                }
                _self.clearValidationInfo(_self.props);
            }
        });
    }

    refreshMultiSelect() {
        let _self = this;
        $("#" + this.componentId).multiselect('destroy');
        _self.setMultiselect();
    }

    limitSelectNum() {
        let selectObj = $("#" + this.componentId);
        let selectedOptions = $("#" + this.componentId + " option:selected");
        let allOptions = $("#" + this.componentId + " option");
        // Get selected options.
        if (selectedOptions.length >= this.props.limitedNum) {
            // Disable all other checkboxes.
            var nonSelectedOptions = allOptions.filter(function () {
                return !$(this).is(':selected');
            });

            var dropdown = selectObj.siblings('.multiselect-container');
            nonSelectedOptions.each(function () {
                var input = $('input[value="' + $(this).val() + '"]');
                input.prop('disabled', true);
                input.parent('li').addClass('disabled');
            });
        }
        else {
            // Enable all checkboxes.
            var dropdown = selectObj.siblings('.multiselect-container');
            allOptions.each(function () {
                var input = $('input[value="' + $(this).val() + '"]');
                input.prop('disabled', false);
                input.parent('li').addClass('disabled');
            });
        }
    }

    setOption(self, selfElement, optionJson) {
        let valueTemp = self.getComponentValue();
        let needbind = false;
        let optionNum = 1;
        let optionIndex = 0;
        if (selfElement && selfElement['length'] > 1) {
            selfElement.empty();
        }
        let option = [];
        if (_.size(optionJson) == 1 && self.props.model && self.props.property) {
            needbind = true;
        }
        $.each(optionJson, (index, element) => {
            let key = element[config.DEFAULT_CODETABLE_KEYVALUE.KEY];
            let value = element[config.DEFAULT_CODETABLE_KEYVALUE.VALUE];
            if (value) {
                value = value.replace(new RegExp(/</g), "&lt;");
            }
            if (needbind) {

                if (self.props.onChange && !self.props.model[self.props.property]) {
                    let newValue = null;
                    if (Util.parseBool(self.props.multiSelect)) {
                        newValue = [key];
                    } else {
                        newValue = key;
                    }
                    self.props.onChange(new OnChangeEvent(self, null, {}, newValue, null));
                }
            }
            if (needbind || self.isKeyValueElement(valueTemp, key)) {
                option.push('<option value="' + key + '" selected>' + value + '</option>');
                optionNum++;
                if (this.props.selectAllShowText) {
                    if (optionJson.length != option.length) {
                        this.state.allSelectedText += value + ',';
                    } else {
                        this.state.allSelectedText += value + '';
                    }
                } else {
                    this.state.allSelectedText = 'Select All';
                }
            } else if (this.props.optionDisabled == 'disabled' && optionNum == this.props.optionDisabledNum[optionIndex]) {
                option.push('<option value="' + key + '" disabled="disabled">' + value + '</option>');
                optionNum++;
                optionIndex++;
            } else if (this.props.optionSectionDisabled == 'disabled' && optionNum == this.props.startOption && this.props.startOption <= this.props.endOption) {
                option.push('<option value="' + key + '" disabled="disabled">' + value + '</option>');
                optionNum++;
                this.props.startOption++;
            } else if (this.props.optionAllDisabled == 'disabled') {
                option.push('<option value="' + key + '" disabled="disabled">' + value + '</option>');
            } else {
                option.push('<option value="' + key + '">' + value + '</option>');
                optionNum++;
                if (this.props.selectAllShowText) {
                    if (optionJson.length != option.length) {
                        this.state.allSelectedText += value + ',';
                    } else {
                        this.state.allSelectedText += value + '';
                    }
                } else {
                    this.state.allSelectedText = 'Select All';
                }
            }
        });
        if (self.props.groups) {
            const groupsArray = [];
            _.each(self.props.groups, (group) => {
                groupsArray.push('<optgroup label=' + self.getI18n(group.title) + '>');
                _.slice(option, group.start, group.end ? group.end : option.length).forEach((opt) => {
                    groupsArray.push(opt);
                });
                groupsArray.push('</optgroup>');
            });
            selfElement.html(groupsArray.join(""));
        } else {
            selfElement.html(option.join(""));
        }
    }

    handlerSelect4In(data, selfElement) {
        let _self = this;
        let dataArray = [];
        const codetable_key = config["DEFAULT_CODETABLE_KEYVALUE"]["KEY"];
        const codetable_value = config["DEFAULT_CODETABLE_KEYVALUE"]["VALUE"];
        const codetable_api_key = config["DEFAULT_API_CODETABLE_KEYVALUE"]["KEY"];
        const codetable_api_value = config["DEFAULT_API_CODETABLE_KEYVALUE"]["VALUE"];
        if (data && data.codes && data.codes.length > 0) {
            data.codes.forEach(function (codeItem) {
                const code = {};
                code[codetable_key] = codeItem[codetable_key];
                code[codetable_value] = codeItem[codetable_value];
                dataArray.push(code);
            });
        } if (data && data.BusinessCodeTableValueList && data.BusinessCodeTableValueList.length > 0) {
            data.BusinessCodeTableValueList.forEach(function (codeItem) {
                const code = {};
                code[codetable_key] = codeItem[codetable_api_key];
                code[codetable_value] = codeItem[codetable_api_value];
                dataArray.push(code);
            });
        } else if (Util.isArray(data)) {
            data.forEach(function (codeItem) {
                const code = {};
                code[codetable_key] = codeItem[codetable_api_key];
                code[codetable_value] = codeItem[codetable_api_value];
                dataArray.push(code);
            });
        }
        _self.setOption(_self, selfElement, new CodeTable(dataArray, null, null).getCode());
        _self.refreshMultiSelect();

    }

    fillSelectOption() {
        let _self = this;
        let selfElement = this.getSelfElement(this.componentId);
        let { codeTableId, conditionMap, codeTableName } = this.props;
        let urlObject = this.props.url;
        let valueOption = this.props.valueOption;
        if (codeTableId) {
            if (!config.isNotShowCodetableIdWarning) {
                toastr["warning"](this.countdown());
            }
            CodeTableService.getCodeTable({ "CodeTableId": codeTableId, "ConditionMap": conditionMap }).then(function (data) {
                _self.handlerSelect4In(data, selfElement);
            });
        } else if (urlObject) {
            let array = [];
            CodeTableService.fetchCodeTable(urlObject).then(function (data) {
                _self.handlerSelect4In(data, selfElement);
            });
        } else if (codeTableName) {
            if (Util.parseBool(this.props.immediately)) {
                CodeTableService.getCodeTable({ "CodeTableName": codeTableName, "ConditionMap": conditionMap }).then(function (data) {
                    _self.handlerSelect4In(data, selfElement);
                });
            } else {
                _self.saveCodetableNames(codeTableName, conditionMap);
            }
        } else if (valueOption) {
            const codetable_api_key = config["DEFAULT_API_CODETABLE_KEYVALUE"]["KEY"];
            const codetable_api_value = config["DEFAULT_API_CODETABLE_KEYVALUE"]["VALUE"];
            let data = [];
            valueOption.forEach(function (value) {
                const dataMap = {};
                var n = Number(value);
                if (!isNaN(n)) {
                    value = _self.formatNumber(value);
                }
                dataMap[codetable_api_key] = value;
                dataMap[codetable_api_value] = value;
                data.push(dataMap);
            });
            _self.handlerSelect4In(data, selfElement);
        } else {
            let optionJson = this.getOptionJson();
            if (optionJson) {
                _self.setOption(_self, selfElement, optionJson);
            }
        }
    }

    /*** Get parent element */
    getParentElement() {
        if (this.props.parentType == 'radio') {
            return $('[name="' + this.props.parentId + '"]:checked');
        }
        return $("#" + this.props.parentId);
    }

    /*** Get self element */
    getSelfElement(componentId) {
        return $("#" + this.componentId);
    }

    /*** Get children element */
    getChildrenElement() {
        return $("#" + this.props.childrenId);
    }

    formatNumber(str) {
        var newStr = "";
        var count = 0;
        if (str.indexOf(".") == -1) {
            for (var i = str.length - 1; i >= 0; i--) {
                if (count % 3 == 0 && count != 0) {
                    newStr = str.charAt(i) + "," + newStr;
                } else {
                    newStr = str.charAt(i) + newStr;
                }
                count++;
            }
            return newStr;
        }
        else {
            for (var i = str.indexOf(".") - 1; i >= 0; i--) {
                if (count % 3 == 0 && count != 0) {
                    newStr = str.charAt(i) + "," + newStr;
                } else {
                    newStr = str.charAt(i) + newStr; //逐个字符相接起来
                }
                count++;
            }
            str = newStr + str.substr(str.indexOf("."));
            return str;
        }
    }
    getSize() {
        if (this.props.size != null && this.props.size != undefined) {
            return "btn-" + this.props.size;
        }
        return "";
    }
};


Multiselect.propTypes = $.extend({}, KeyValue.propTypes, {
    single: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    selectAll: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    search: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    type: PropTypes.string,
    width: PropTypes.string,
    dropRight: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    dropUp: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    componentType: PropTypes.string,
    num: PropTypes.number,
    selectAllNumber: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    selectAllShowText: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    optionDisabled: PropTypes.string,
    optionAllDisabled: PropTypes.string,
    optionSectionDisabled: PropTypes.string,
    optionDisabledNum: PropTypes.object,
    startOption: PropTypes.number,
    endOption: PropTypes.number,
    limitedNum: PropTypes.number
});


Multiselect.defaultProps = $.extend({}, KeyValue.defaultProps, {
    single: false,
    selectAll: false,
    search: false,
    dropRight: false,
    dropUp: false,
    componentType: 'multiselect',
    type: "default",
    num: 4,
    selectAllShowText: false,
    selectAllNumber: false
});
