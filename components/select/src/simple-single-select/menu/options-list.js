import PropTypes from 'prop-types'
import React, { forwardRef, useEffect, useState } from 'react'
import { isOptionHidden } from '../is-option-hidden.js'
import { optionProp } from '../shared-prop-types.js'
import { Option } from './option.js'

export const OptionsList = forwardRef(function OptionsList(
    {
        comboBoxId,
        optionComponent,
        focussedOptionIndex,
        id,
        labelledBy,
        optionUpdateStrategy,
        options,
        selectedValue,
        dataTest,
        disabled,
        loading,
        onChange,
        onBlur,
        onEndReached,
        filterDataTest = '',
        setFocussedOptionIndex = undefined,
        filterFocused = false,
    },
    ref
) {
    // scrolls the highlighted option into view when:
    // * the highlighted option changes
    // * the menu opens
    useEffect(() => {
        if (filterFocused) {
            return
        }
        const { current: listBox } = ref
        const highlightedOption = listBox.childNodes[focussedOptionIndex]

        if (highlightedOption) {
            const listBoxParent = listBox.parentNode
            const optionHidden = isOptionHidden(
                highlightedOption,
                listBoxParent
            )

            if (optionHidden) {
                highlightedOption.scrollIntoView()
            }
        }
    }, [focussedOptionIndex, ref, filterFocused])

    const focusOptionByIndex = (idx) => {
        requestAnimationFrame(() => {
            const el = document.getElementById(`${comboBoxId}-${idx}`)
            el?.focus()
        })
    }

    const handleOptionKeyDown = (e, index) => {
        const { key } = e
        if (key === 'ArrowDown') {
            e.preventDefault()
            const next = Math.min(index + 1, options.length - 1)
            setFocussedOptionIndex?.(next)
            focusOptionByIndex(next)
            return
        }

        if (key === 'ArrowUp') {
            e.preventDefault()
            const prev = index - 1
            if (prev >= 0) {
                setFocussedOptionIndex?.(prev)
                focusOptionByIndex(prev)
            } else {
                const filterInput =
                    filterDataTest &&
                    document.querySelector(
                        `[data-test=\"${filterDataTest}-input\"] input`
                    )
                if (filterInput) {
                    requestAnimationFrame(() => {
                        filterInput.focus()
                        try {
                            const len = filterInput.value?.length ?? 0
                            filterInput.setSelectionRange?.(len, len)
                        } catch {}
                    })
                }
            }
            return
        }
    }

    return (
        <>
            <div
                ref={ref}
                role="listbox"
                id={id}
                aria-labelledby={labelledBy}
                aria-live={optionUpdateStrategy}
                aria-busy={loading.toString()}
                data-test={dataTest}
                onBlur={onBlur}
            >
                {options.map(
                    (
                        {
                            value,
                            label,
                            component,
                            disabled: optionDisabled = false,
                        },
                        index
                    ) => {
                        const isSelected = value === selectedValue
                        const isLast = index === options.length - 1

                        return (
                            <Option
                                listBoxRef={ref}
                                dataTest={`${dataTest}-option`}
                                highlighted={focussedOptionIndex === index}
                                key={value}
                                value={value}
                                label={label}
                                index={index}
                                comboBoxId={comboBoxId}
                                disabled={disabled || optionDisabled}
                                onClick={isSelected ? () => null : onChange}
                                component={component || optionComponent}
                                onBecameVisible={isLast ? onEndReached : undefined}
                                onKeyDown={(e) => handleOptionKeyDown(e, index)}
                            />
                        )
                    }
                )}
            </div>
        </>
    )
})

OptionsList.propTypes = {
    comboBoxId: PropTypes.string.isRequired,
    focussedOptionIndex: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(optionProp).isRequired,
    onChange: PropTypes.func.isRequired,
    dataTest: PropTypes.string,
    disabled: PropTypes.bool,
    labelledBy: PropTypes.string,
    loading: PropTypes.bool,
    optionComponent: PropTypes.elementType,
    optionUpdateStrategy: PropTypes.oneOf(['off', 'polite', 'assertive']),
    selectedValue: PropTypes.string,
    onBlur: PropTypes.func,
    onEndReached: PropTypes.func,
    filterDataTest: PropTypes.string,
    setFocussedOptionIndex: PropTypes.func,
    filterFocused: PropTypes.bool,
}
